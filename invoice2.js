const TEMPLATE_TYPE = "invoice";
const TEMPLATE_LABEL = "invoice";
const TARGET_TEMPLATE_TYPE = "estimate";
const TARGET_TEMPLATE_LABEL = "estimate";
const TEMPLATE_SAVE_FUNCTION = "saveInvoiceTemplate";
const TEMPLATE_GET_FUNCTION = "getInvoiceTemplate";
const TEMPLATE_RESET_FUNCTION = "resetInvoiceTemplate";
const TEMPLATE_TRANSFER_KEY = "invoicepro_template_transfer_v1";
const TARGET_TEMPLATE_URL = "estimates-design.html";

const sections = [
    {button:"headerSectionButton",section:"invoiceHeaderSelection",badge:"invoiceEditBadge",title:"Editing Header"},
    {button:"companySectionButton",section:"invoiceCompanySelection",badge:"invoiceCompanyBadge",title:"Editing Company Information"},
    {button:"customerSectionButton",section:"invoiceCustomerSelection",badge:"invoiceCustomerBadge",title:"Editing Customer Information"},
    {button:"invoiceDetailsButton",section:"invoiceDetailsSelection",badge:"invoiceDetailsBadge",title:"Editing Invoice Details"},
    {button:"itemsTableButton",section:"invoiceItemsSelection",badge:"invoiceItemsBadge",title:"Editing Items Table"},
    {button:"totalsButton",section:"invoiceTotalsSelection",badge:"invoiceTotalsBadge",title:"Editing Totals"},
    {button:"notesButton",section:"invoiceNotesSelection",badge:"invoiceNotesBadge",title:"Editing Notes"},
    {button:"paymentButton",section:"invoicePaymentSelection",badge:"invoicePaymentBadge",title:"Editing Payment Information"},
    {button:"footerButton",section:"invoiceFooterSelection",badge:"invoiceFooterBadge",title:"Editing Footer"}
];

const defaultTemplateSettings = {
    backgroundColor:null,
    textColor:null,
    accentColor:"#2563EB",
    borderRadius:null,
    padding:null,
    marginBottom:null,
    opacity:100,
    fontFamily:null,
    fontWeight:null,
    fontSize:null,
    letterSpacing:null,
    lineHeight:null,
    width:null,
    borderWidth:null,
    borderColor:null,
    borderStyle:null,
    shadowEnabled:false,
    shadowBlur:12,
    borderEnabled:false,
    textAlign:null,
    textTransform:null,
    sectionAlign:null,
    animation:"none",
    overflow:null,
    zIndex:null,
    showLogo:true,
    showCompanyInfo:true,
    showCustomerInfo:true,
    showInvoiceNumber:true,
    showInvoiceDates:true,
    showPaymentInfo:true,
    showNotes:true,
    showFooter:true,
    locked:false,
    bold:false,
    italic:false,
    underline:false,
    strike:false,
    customCssClass:""
};

const presets = {
    modern:{backgroundColor:"#0D47A1",textColor:"#FFFFFF",accentColor:"#1E88E5",borderRadius:12,padding:24,shadowEnabled:true,shadowBlur:18,borderEnabled:false,fontFamily:"Inter",fontWeight:"600"},
    minimal:{backgroundColor:"#FFFFFF",textColor:"#222222",accentColor:"#666666",borderRadius:0,padding:20,shadowEnabled:false,shadowBlur:0,borderEnabled:true,borderWidth:1,borderColor:"#D9E2EC",fontFamily:"Inter",fontWeight:"400"},
    corporate:{backgroundColor:"#003366",textColor:"#FFFFFF",accentColor:"#1565C0",borderRadius:4,padding:18,shadowEnabled:false,shadowBlur:0,borderEnabled:true,borderWidth:1,borderColor:"#D9E2EC",fontFamily:"Montserrat",fontWeight:"600"},
    creative:{backgroundColor:"#8E24AA",textColor:"#FFFFFF",accentColor:"#FF9800",borderRadius:22,padding:28,shadowEnabled:true,shadowBlur:24,borderEnabled:false,fontFamily:"Poppins",fontWeight:"500"}
};

const visibilityMap = [
    {setting:"showLogo",selector:"#invoiceLogo"},
    {setting:"showCompanyInfo",selector:"#invoiceCompanySelection"},
    {setting:"showCustomerInfo",selector:"#invoiceCustomerSelection"},
    {setting:"showInvoiceNumber",selector:"#invoiceDetailsSelection .invoice-detail:nth-child(1)"},
    {setting:"showInvoiceDates",selector:"#invoiceDetailsSelection .invoice-detail:nth-child(2),#invoiceDetailsSelection .invoice-detail:nth-child(3)"},
    {setting:"showPaymentInfo",selector:"#invoicePaymentSelection"},
    {setting:"showNotes",selector:"#invoiceNotesSelection"},
    {setting:"showFooter",selector:"#invoiceFooterSelection"}
];

const invoiceBrandState = {logoURL:null,businessName:"InvoicePro"};
const sectionSettings = {};
let currentSectionId = "invoiceHeaderSelection";
let templateSettings = {};
let visibilityInitialized = false;
let globalVisibilitySettings = {
    showLogo:true,
    showCompanyInfo:true,
    showCustomerInfo:true,
    showInvoiceNumber:true,
    showInvoiceDates:true,
    showPaymentInfo:true,
    showNotes:true,
    showFooter:true
};
let previewSection = null;
let ctx = null;
let dragging = false;
let canvas = null;
let cursor = null;
let hueSlider = null;
let suppressCloudLoad = false;
let dirtySections = new Set();
let globalVisibilityDirty = false;

function $(id){
    return document.getElementById(id);
}

function cloneDefaults(){
    return {...defaultTemplateSettings};
}

function getSectionSettings(sectionId){
    if(!sectionSettings[sectionId]){
        sectionSettings[sectionId] = cloneDefaults();
    }
    return sectionSettings[sectionId];
}

function setCurrentSettings(settings){
    templateSettings = {...cloneDefaults(),...(settings || {})};
    if(!templateSettings.fontFamily) templateSettings.fontFamily = "Inter";
    if(templateSettings.shadowBlur == null || templateSettings.shadowBlur === "") templateSettings.shadowBlur = 12;
    if(!visibilityInitialized && settings){
        Object.keys(globalVisibilitySettings).forEach(key=>{
            if(Object.prototype.hasOwnProperty.call(settings,key)){
                globalVisibilitySettings[key] = settings[key] !== false;
            }
        });
        visibilityInitialized = true;
    }
    Object.keys(globalVisibilitySettings).forEach(key=>{
        templateSettings[key] = globalVisibilitySettings[key];
    });
    sectionSettings[currentSectionId] = {...templateSettings};
}

function isValidHexColor(value){
    return typeof value === "string" && /^#[0-9A-F]{6}$/i.test(value.trim());
}

function normalizeHex(value,fallback){
    const v = String(value || "").trim();
    return isValidHexColor(v) ? v.toUpperCase() : fallback;
}

function updateSetting(key,value){
    templateSettings[key] = value;
    sectionSettings[currentSectionId] = {...templateSettings};
    dirtySections.add(currentSectionId);
    if(Object.prototype.hasOwnProperty.call(globalVisibilitySettings,key)){
        globalVisibilitySettings[key] = !!value;
        globalVisibilityDirty = true;
        Object.keys(sectionSettings).forEach(sectionId=>{
            sectionSettings[sectionId] = {...sectionSettings[sectionId], [key]:!!value};
        });
    }
    applySettings();
}

function getTextTargets(section){
    if(!section) return [];
    return Array.from(section.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,div,th,td,a,label"));
}

function applyAccent(section,accent){
    if(!section || !isValidHexColor(accent)) return;
    section.style.setProperty("--invoice-accent",accent);
    section.style.setProperty("--template-accent",accent);
    const targets = [
        ".invoice-title",
        ".invoice-company-website",
        ".invoice-section-heading",
        ".invoice-party-name",
        ".invoice-payment-title",
        ".invoice-notes-title",
        ".invoice-footer-icon",
        ".invoice-detail-value",
        ".invoice-edit-badge",
        ".invoice-selection-top",
        ".invoice-grand-total"
    ];
    targets.forEach(selector=>{
        section.querySelectorAll(selector).forEach(el=>{
            if(selector === ".invoice-grand-total"){
                el.style.setProperty("border-color",accent,"important");
            }else{
                el.style.setProperty("color",accent,"important");
                if(selector === ".invoice-footer-icon") el.style.setProperty("background-color",accent,"important");
            }
        });
    });
}
function applyTextSizing(section){
    if(!section) return;
    const size = Number(templateSettings.fontSize);
    const base = Number(section.dataset.templateBaseFontSize || 16);
    if(Number.isFinite(size) && size > 0){
        const ratio = size / base;
        section.style.fontSize = size + "px";
        getTextTargets(section).forEach(el=>{
            if(!el.dataset.templateOriginalFontSize){
                const computed = parseFloat(window.getComputedStyle(el).fontSize);
                if(Number.isFinite(computed) && computed > 0){
                    el.dataset.templateOriginalFontSize = computed;
                }
            }
            const original = parseFloat(el.dataset.templateOriginalFontSize);
            if(Number.isFinite(original) && original > 0){
                el.style.fontSize = (original * ratio) + "px";
            }
        });
    }else{
        section.style.removeProperty("font-size");
        getTextTargets(section).forEach(el=>{
            if(el.dataset.templateOriginalFontSize){
                el.style.fontSize = el.dataset.templateOriginalFontSize + "px";
            }else{
                el.style.removeProperty("font-size");
            }
        });
    }
}

function applyFontStyle(section){
    if(!section) return;
    const targets = getTextTargets(section);
    const weight = templateSettings.bold ? "700" : (templateSettings.fontWeight || "");
    targets.forEach(el=>{
        if(templateSettings.fontFamily) el.style.setProperty("font-family",templateSettings.fontFamily,"important");
        else el.style.removeProperty("font-family");
        if(weight) el.style.setProperty("font-weight",weight,"important");
        else el.style.removeProperty("font-weight");
        el.style.setProperty("font-style",templateSettings.italic ? "italic" : "normal","important");
        const decorations = [];
        if(templateSettings.underline) decorations.push("underline");
        if(templateSettings.strike) decorations.push("line-through");
        el.style.setProperty("text-decoration",decorations.join(" ") || "none","important");
        if(templateSettings.letterSpacing != null && templateSettings.letterSpacing !== ""){
            el.style.setProperty("letter-spacing",templateSettings.letterSpacing + "px","important");
        }else{
            el.style.removeProperty("letter-spacing");
        }
        if(templateSettings.lineHeight != null && templateSettings.lineHeight !== ""){
            el.style.setProperty("line-height",String(templateSettings.lineHeight),"important");
        }else{
            el.style.removeProperty("line-height");
        }
        if(templateSettings.textTransform) el.style.setProperty("text-transform",templateSettings.textTransform,"important");
        else el.style.removeProperty("text-transform");
        if(templateSettings.textAlign) el.style.setProperty("text-align",templateSettings.textAlign,"important");
        else el.style.removeProperty("text-align");
    });
}
function applyCustomClass(section){
    if(!section) return;
    const oldClasses = Array.from(section.classList).filter(c=>c.startsWith("template-custom-"));
    oldClasses.forEach(c=>section.classList.remove(c));
    const raw = String(templateSettings.customCssClass || "").trim();
    if(!raw) return;
    raw.split(/\s+/).forEach(name=>{
        if(/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)){
            section.classList.add("template-custom-" + name);
        }
    });
}

function applySettings(){
    const section = previewSection;
    if(!section) return;

    if(templateSettings.backgroundColor) section.style.backgroundColor = templateSettings.backgroundColor;
    else section.style.removeProperty("background-color");

    if(templateSettings.textColor){
        section.style.setProperty("color",templateSettings.textColor,"important");
        getTextTargets(section).forEach(el=>el.style.setProperty("color",templateSettings.textColor,"important"));
    }else{
        section.style.removeProperty("color");
        getTextTargets(section).forEach(el=>el.style.removeProperty("color"));
    }

    if(templateSettings.borderRadius != null) section.style.borderRadius = templateSettings.borderRadius + "px";
    else section.style.removeProperty("border-radius");

    if(templateSettings.padding != null) section.style.padding = templateSettings.padding + "px";
    else section.style.removeProperty("padding");

    if(templateSettings.marginBottom != null) section.style.marginBottom = templateSettings.marginBottom + "px";
    else section.style.removeProperty("margin-bottom");

    if(templateSettings.opacity != null) section.style.opacity = Number(templateSettings.opacity) / 100;
    else section.style.removeProperty("opacity");

    if(templateSettings.width != null) section.style.width = templateSettings.width + "%";
    else section.style.removeProperty("width");

    if(templateSettings.sectionAlign === "left"){
        section.style.marginLeft = "0";
        section.style.marginRight = "auto";
    }else if(templateSettings.sectionAlign === "center"){
        section.style.marginLeft = "auto";
        section.style.marginRight = "auto";
    }else if(templateSettings.sectionAlign === "right"){
        section.style.marginLeft = "auto";
        section.style.marginRight = "0";
    }else{
        section.style.removeProperty("margin-left");
        section.style.removeProperty("margin-right");
    }

    if(templateSettings.borderEnabled){
        section.style.borderStyle = templateSettings.borderStyle || "solid";
        section.style.borderWidth = (templateSettings.borderWidth != null ? templateSettings.borderWidth : 1) + "px";
        section.style.borderColor = templateSettings.borderColor || "#D9E2EC";
    }else{
        section.style.borderWidth = "0";
    }

    if(templateSettings.shadowEnabled){
        const strength = Math.max(0,Math.min(50,Number(templateSettings.shadowBlur) || 0));
        const blur = Math.max(8,Math.round(8 + strength * 1.4));
        const y = Math.max(3,Math.round(3 + strength * 0.18));
        const opacity = Math.min(0.34,0.08 + strength / 180);
        section.style.boxShadow = `0 ${y}px ${blur}px rgba(16,24,40,${opacity})`;
    }else{
        section.style.boxShadow = "none";
    }

    section.style.overflow = templateSettings.overflow || "visible";
    section.style.zIndex = templateSettings.zIndex != null ? templateSettings.zIndex : "";

    section.style.animation = "none";
    if(templateSettings.animation === "fade") section.style.animation = "fadeAnimation .35s ease";
    if(templateSettings.animation === "slide") section.style.animation = "slideAnimation .35s ease";
    if(templateSettings.animation === "zoom") section.style.animation = "zoomAnimation .35s ease";

    section.style.pointerEvents = templateSettings.locked ? "none" : "auto";

    applyAccent(section,templateSettings.accentColor);
    applyTextSizing(section);
    applyFontStyle(section);
    applyCustomClass(section);

    const visibilityRoot = $("invoicePaper") || section;
    visibilityMap.forEach(item=>{
        const elements = visibilityRoot.querySelectorAll(item.selector);
        elements.forEach(element=>{
            element.style.display = templateSettings[item.setting] === false ? "none" : "";
        });
    });
}

function updateColorControls(colorId,textId,value){
    const color = $(colorId);
    const text = $(textId);
    const hex = normalizeHex(value,color ? color.value : "#000000");
    if(color) color.value = hex;
    if(text) text.value = hex;
}

function connectColor(colorId,textId,setting){
    const color = $(colorId);
    const text = $(textId);
    if(!color || !text) return;

    const apply = value=>{
        if(!isValidHexColor(value)) return;
        const hex = value.trim().toUpperCase();
        color.value = hex;
        text.value = hex;
        updateSetting(setting,hex);
        if(setting === "backgroundColor") updateColorPicker(hex);
    };

    color.addEventListener("input",()=>apply(color.value));
    color.addEventListener("change",()=>apply(color.value));
    text.addEventListener("input",()=>{
        const value = text.value.trim();
        if(isValidHexColor(value)) apply(value);
    });
    text.addEventListener("change",()=>{
        const value = text.value.trim();
        if(isValidHexColor(value)) apply(value);
        else text.value = color.value;
    });
}

function connectSlider(sliderId,valueId,setting,unit=""){
    const slider = $(sliderId);
    const value = $(valueId);
    if(!slider || !value) return;
    const render = ()=>{
        value.textContent = slider.value + unit;
        updateSetting(setting,slider.value);
    };
    slider.addEventListener("input",render);
    slider.addEventListener("change",render);
}

function connectSelect(id,setting){
    const select = $(id);
    if(!select) return;
    select.addEventListener("change",()=>updateSetting(setting,select.value));
}

function connectInput(id,setting){
    const input = $(id);
    if(!input) return;
    input.addEventListener("input",()=>updateSetting(setting,input.value));
    input.addEventListener("change",()=>updateSetting(setting,input.value));
}

function connectSwitch(id,setting){
    const input = $(id);
    if(!input) return;
    input.addEventListener("change",()=>updateSetting(setting,input.checked));
}

function activateButtons(group,active){
    group.forEach(btn=>btn && btn.classList.toggle("active",btn===active));
}

function setupButtonGroup(ids,setting){
    const group = ids.map($).filter(Boolean);
    group.forEach(btn=>{
        btn.addEventListener("click",event=>{
            event.preventDefault();
            activateButtons(group,btn);
            const value = btn.id.replace(setting==="textAlign" ? "textAlign" : "sectionAlign","").toLowerCase();
            updateSetting(setting,value);
        });
    });
}

function setupToggleButton(id,setting){
    const btn = $(id);
    if(!btn) return;
    btn.addEventListener("click",event=>{
        event.preventDefault();
        const active = !btn.classList.contains("active");
        btn.classList.toggle("active",active);
        updateSetting(setting,active);
    });
}

function drawColorCanvas(hue){
    if(!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = `hsl(${hue},100%,50%)`;
    ctx.fillRect(0,0,w,h);
    const white = ctx.createLinearGradient(0,0,w,0);
    white.addColorStop(0,"#fff");
    white.addColorStop(1,"transparent");
    ctx.fillStyle = white;
    ctx.fillRect(0,0,w,h);
    const black = ctx.createLinearGradient(0,0,0,h);
    black.addColorStop(0,"transparent");
    black.addColorStop(1,"#000");
    ctx.fillStyle = black;
    ctx.fillRect(0,0,w,h);
}

function canvasPick(event){
    if(!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    const x = Math.max(0,Math.min(canvas.width-1,(event.clientX-rect.left)*(canvas.width/rect.width)));
    const y = Math.max(0,Math.min(canvas.height-1,(event.clientY-rect.top)*(canvas.height/rect.height)));
    const pixel = ctx.getImageData(Math.floor(x),Math.floor(y),1,1).data;
    const hex = "#" + [pixel[0],pixel[1],pixel[2]].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
    if(cursor){
        cursor.style.left = (x / canvas.width * 100) + "%";
        cursor.style.top = (y / canvas.height * 100) + "%";
    }
    updateSetting("backgroundColor",hex);
    updateColorControls("headerBackgroundColor","headerBackgroundHex",hex);
}

function updateColorPicker(hex){
    const value = normalizeHex(hex,"#0D47A1");
    updateColorControls("headerBackgroundColor","headerBackgroundHex",value);
}

function setActivePreset(name){
    document.querySelectorAll(".template-preset-card").forEach(card=>card.classList.remove("active"));
    const id = "preset" + name.charAt(0).toUpperCase() + name.slice(1);
    const button = $(id);
    if(button) button.classList.add("active");
}

function loadPreset(name){
    if(!presets[name]) return;
    setCurrentSettings({...getSectionSettings(currentSectionId),...cloneDefaults(),...presets[name]});
    dirtySections.add(currentSectionId);
    setActivePreset(name);
    refreshControls();
    applySettings();
}

function refreshControls(){
    const s = templateSettings;

    updateColorControls("headerBackgroundColor","headerBackgroundHex",s.backgroundColor || "#0D47A1");
    updateColorControls("headerTextColor","headerTextHex",s.textColor || "#FFFFFF");
    updateColorControls("headerAccentColor","headerAccentHex",s.accentColor || "#2563EB");
    updateColorControls("borderColor","borderColorHex",s.borderColor || "#D9E2EC");

    const sliders = [
        ["headerBorderRadius","headerRadiusValue","borderRadius","px"],
        ["headerPadding","headerPaddingValue","padding","px"],
        ["headerMargin","headerMarginValue","marginBottom","px"],
        ["headerOpacity","headerOpacityValue","opacity","%"],
        ["headerFontSize","headerFontSizeValue","fontSize","px"],
        ["headerLetterSpacing","headerLetterSpacingValue","letterSpacing","px"],
        ["headerLineHeight","headerLineHeightValue","lineHeight",""],
        ["sectionWidth","sectionWidthValue","width","%"],
        ["borderWidth","borderWidthValue","borderWidth","px"],
        ["shadowBlur","shadowBlurValue","shadowBlur","px"],
        ["sectionZIndex","zIndexValue","zIndex",""]
    ];

    sliders.forEach(([id,valueId,key,unit])=>{
        const input = $(id);
        const output = $(valueId);
        if(!input || !output) return;
        if(s[key] != null && s[key] !== ""){
            input.value = s[key];
            output.textContent = s[key] + unit;
        }
    });

    if($("headerFontFamily")) $("headerFontFamily").value = s.fontFamily || "Inter";
    if($("headerFontWeight")) $("headerFontWeight").value = s.fontWeight || "400";
    if($("headerTextTransform")) $("headerTextTransform").value = s.textTransform || "none";
    if($("borderStyle")) $("borderStyle").value = s.borderStyle || "solid";
    if($("sectionAnimation")) $("sectionAnimation").value = s.animation || "none";
    if($("sectionOverflow")) $("sectionOverflow").value = s.overflow || "visible";
    if($("customCssClass")) $("customCssClass").value = s.customCssClass || "";

    [["sectionShadow","shadowEnabled"],["sectionBorder","borderEnabled"],["sectionBorderEnabled","borderEnabled"],["shadowEnabled","shadowEnabled"],["toggleCompanyLogo","showLogo"],["toggleCompanyInfo","showCompanyInfo"],["toggleCustomerInfo","showCustomerInfo"],["toggleInvoiceNumber","showInvoiceNumber"],["toggleInvoiceDates","showInvoiceDates"],["togglePaymentInfo","showPaymentInfo"],["toggleNotes","showNotes"],["toggleFooter","showFooter"],["lockSection","locked"]].forEach(([id,key])=>{
        const input = $(id);
        if(input) input.checked = !!s[key];
    });

    const align = s.textAlign || "left";
    activateButtons([$("textAlignLeft"),$("textAlignCenter"),$("textAlignRight"),$("textAlignJustify")],$("textAlign"+align.charAt(0).toUpperCase()+align.slice(1)));

    const sectionAlign = s.sectionAlign || "left";
    activateButtons([$("sectionAlignLeft"),$("sectionAlignCenter"),$("sectionAlignRight")],$("sectionAlign"+sectionAlign.charAt(0).toUpperCase()+sectionAlign.slice(1)));

    [["fontBoldButton","bold"],["fontItalicButton","italic"],["fontUnderlineButton","underline"],["fontStrikeButton","strike"]].forEach(([id,key])=>{
        const btn = $(id);
        if(btn) btn.classList.toggle("active",!!s[key]);
    });

    if(s.backgroundColor) updateColorPicker(s.backgroundColor);
}

function getTemplateTransferModal(){
    return $("templateTransferModal");
}

function closeTemplateTransferModal(){
    const modal = getTemplateTransferModal();
    if(modal) modal.classList.remove("active");
    document.body.classList.remove("template-transfer-modal-open");
    try{
        localStorage.removeItem(TEMPLATE_TRANSFER_KEY);
    }catch(error){
        console.error("Unable to clear template transfer:",error);
    }
}

function openTemplateTransferModal(){
    const modal = getTemplateTransferModal();
    if(!modal) return;
    modal.classList.add("active");
    document.body.classList.add("template-transfer-modal-open");
}

function storeTemplateTransfer(savedSections, templateName){
    try{
        const payload = {
            version: 1,
            source: TEMPLATE_TYPE,
            target: TARGET_TEMPLATE_TYPE,
            templateName: templateName || "Modern",
            createdAt: Date.now(),
            sections: savedSections
        };
        localStorage.setItem(TEMPLATE_TRANSFER_KEY, JSON.stringify(payload));
        return true;
    }catch(error){
        console.error("Unable to prepare template transfer:", error);
        return false;
    }
}

function applyPendingTemplateTransfer(){
    try{
        const raw = localStorage.getItem(TEMPLATE_TRANSFER_KEY);
        if(!raw) return false;

        const payload = JSON.parse(raw);
        if(
            !payload ||
            payload.version !== 1 ||
            payload.source !== TARGET_TEMPLATE_TYPE ||
            payload.target !== TEMPLATE_TYPE ||
            !payload.sections ||
            typeof payload.sections !== "object"
        ){
            return false;
        }

        const sectionIds = Object.keys(payload.sections);
        if(!sectionIds.length) return false;

        sectionIds.forEach(sectionId=>{
            const settings = cloneTemplateData(payload.sections[sectionId] || {});
            sectionSettings[sectionId] = {
                ...cloneDefaults(),
                ...settings
            };
            dirtySections.add(sectionId);
        });

        const firstSection = payload.sections[currentSectionId];
        if(firstSection){
            setCurrentSettings(firstSection);
        }

        const visibilityKeys = Object.keys(globalVisibilitySettings);
        const visibilitySource = firstSection || payload.sections[sectionIds[0]] || {};
        visibilityKeys.forEach(key=>{
            if(Object.prototype.hasOwnProperty.call(visibilitySource,key)){
                globalVisibilitySettings[key] = !!visibilitySource[key];
            }
        });

        globalVisibilityDirty = false;
        window.__templateImportedFromTransfer = true;
        refreshControls();
        applySettings();

        const notice = $("templateTransferNotice");
        if(notice){
            notice.textContent = `Changes from the ${payload.source} template have been applied. Review them, then click Save Templates to save them as your ${TEMPLATE_TYPE} template.`;
            notice.classList.add("active");
        }

        return true;
    }catch(error){
        console.error("Unable to apply pending template transfer:",error);
        return false;
    }
}

function clearPendingTemplateTransfer(){
    try{
        const raw = localStorage.getItem(TEMPLATE_TRANSFER_KEY);
        if(!raw) return;
        const payload = JSON.parse(raw);
        if(payload && payload.target === TEMPLATE_TYPE){
            localStorage.removeItem(TEMPLATE_TRANSFER_KEY);
        }
    }catch(error){
        console.error("Unable to clear template transfer:",error);
    }
}

function setupTemplateTransferControls(){
    const targetLabel = TARGET_TEMPLATE_TYPE.charAt(0).toUpperCase() + TARGET_TEMPLATE_TYPE.slice(1);
    const title = $("templateTransferTitle");
    const message = $("templateTransferMessage");
    const applyActionButton = $("templateTransferApplyButton");

    if(title) title.textContent = `Apply Changes to ${targetLabel}?`;
    if(message){
        message.textContent = `Your ${TEMPLATE_TYPE} template changes have been saved successfully. Do you want to apply the same changes to the ${TARGET_TEMPLATE_TYPE} template?`;
    }
    if(applyActionButton) applyActionButton.textContent = `Apply to ${targetLabel}`;

    const cancelButton = $("templateTransferCancelButton");
    const applyButton = $("templateTransferApplyButton");
    const closeButton = $("templateTransferCloseButton");

    if(cancelButton){
        cancelButton.addEventListener("click",event=>{
            event.preventDefault();
            closeTemplateTransferModal();
        });
    }

    if(closeButton){
        closeButton.addEventListener("click",event=>{
            event.preventDefault();
            closeTemplateTransferModal();
        });
    }

    if(applyButton){
        applyButton.addEventListener("click",event=>{
            event.preventDefault();

            const sections = window.__templateTransferSections;
            const templateName = window.__templateTransferName || "Modern";

            if(!sections || !storeTemplateTransfer(sections,templateName)){
                alert("Unable to prepare the template changes for transfer.");
                return;
            }

            window.location.href = TARGET_TEMPLATE_URL;
        });
    }

    const modal = getTemplateTransferModal();
    if(modal){
        modal.addEventListener("click",event=>{
            if(event.target === modal) closeTemplateTransferModal();
        });
    }
}

function prepareTransferAfterSave(savedSections, templateName){
    if(!savedSections || !Object.keys(savedSections).length) return;
    window.__templateTransferSections = cloneTemplateData(savedSections);
    window.__templateTransferName = templateName || "Modern";
    openTemplateTransferModal();
}

async function saveTemplateToCloud(){
    try{
        sectionSettings[currentSectionId] = {...templateSettings};

        let sectionsToSave = Array.from(dirtySections);
        if(globalVisibilityDirty){
            sectionsToSave = sections.map(item=>item.section);
        }
        if(!sectionsToSave.length) return;

        const responses = [];
        const savedSections = {};

        for(const sectionId of sectionsToSave){
            let settings;

            if(sectionId === currentSectionId){
                settings = {...templateSettings};
            }else if(globalVisibilityDirty){
                const loaded = await Parse.Cloud.run(TEMPLATE_GET_FUNCTION,{section:sectionId});
                settings = loaded && loaded.exists && loaded.settings
                    ? {...cloneDefaults(),...loaded.settings}
                    : {...getSectionSettings(sectionId)};
            }else{
                settings = {...getSectionSettings(sectionId)};
            }

            if(globalVisibilityDirty){
                Object.keys(globalVisibilitySettings).forEach(key=>{
                    settings[key] = globalVisibilitySettings[key];
                });
            }

            delete settings._cloudLoaded;

            const response = await Parse.Cloud.run(TEMPLATE_SAVE_FUNCTION,{
                templateName:"Modern",
                section:sectionId,
                settings:{...settings}
            });

            sectionSettings[sectionId] = {...settings};
            savedSections[sectionId] = cloneTemplateData(settings);
            responses.push(response);
        }

        dirtySections.clear();
        globalVisibilityDirty = false;
        sectionSettings[currentSectionId] = {...templateSettings};

        const importedSave = !!window.__templateImportedFromTransfer;
        window.__templateImportedFromTransfer = false;

        const transferReady = !importedSave;
        if(transferReady){
            prepareTransferAfterSave(savedSections,"Modern");
        }else{
            alert(`${TEMPLATE_TYPE === "invoice" ? "Invoice" : "Estimate"} template saved successfully.`);
        }

        console.log(responses);
    }catch(error){
        console.error(error);
        alert(error && error.message ? error.message : "Unable to save template.");
    }
}


function normalizeTemplateSettings(settings){
    const normalized = cloneDefaults();

    if(settings && typeof settings === "object" && !Array.isArray(settings)){
        Object.keys(settings).forEach(key=>{
            normalized[key] = settings[key];
        });
    }

    return normalized;
}

async function loadAllInvoiceTemplatesFromCloud(){
    const activeSectionId = currentSectionId;
    const activePreviewSection = previewSection;

    const results = await Promise.all(
        sections.map(async item=>{
            try{
                const response = await Parse.Cloud.run(
                    TEMPLATE_GET_FUNCTION,
                    {section:item.section}
                );

                return {
                    section:item.section,
                    response
                };
            }catch(error){
                console.error(
                    `Template loading failed for ${item.section}:`,
                    error
                );

                return {
                    section:item.section,
                    response:null
                };
            }
        })
    );

    results.forEach(({section,response})=>{
        const savedSettings =
            response &&
            response.exists &&
            response.settings &&
            typeof response.settings === "object"
                ? response.settings
                : getSectionSettings(section);

        sectionSettings[section] =
            normalizeTemplateSettings(savedSettings);
    });

    visibilityInitialized = false;

    results.forEach(({section})=>{
        currentSectionId = section;
        previewSection = $(section);

        if(!previewSection) return;

        setCurrentSettings(sectionSettings[section]);
        applySettings();
    });

    currentSectionId = activeSectionId;
    previewSection = activePreviewSection || $(activeSectionId);
    setCurrentSettings(sectionSettings[currentSectionId]);

    dirtySections.clear();
    globalVisibilityDirty = false;
}

async function loadTemplateFromCloud(){
    try{
        const response = await Parse.Cloud.run(TEMPLATE_GET_FUNCTION,{section:currentSectionId});
        if(response && response.exists && response.settings){
            setCurrentSettings(response.settings);
        }else{
            setCurrentSettings(getSectionSettings(currentSectionId));
        }
        dirtySections.delete(currentSectionId);
        refreshControls();
        applySettings();
    }catch(error){
        console.error("Template loading failed:",error);
        setCurrentSettings(getSectionSettings(currentSectionId));
        refreshControls();
        applySettings();
    }
}

async function resetTemplateFromCloud(){
    try{
        const response = await Parse.Cloud.run(TEMPLATE_RESET_FUNCTION,{section:currentSectionId});
        setCurrentSettings(response && response.settings ? response.settings : cloneDefaults());
        dirtySections.delete(currentSectionId);
        refreshControls();
        applySettings();
        alert("Template reset.");
    }catch(error){
        console.error(error);
        alert(error && error.message ? error.message : "Unable to reset template.");
    }
}

function resetTemplateSettings(){
    setCurrentSettings(cloneDefaults());
    dirtySections.add(currentSectionId);
    refreshControls();
    applySettings();
}

async function loadInvoiceBranding(){
    try{
        const user = Parse.User.current();
        if(!user) return;
        const BusinessProfile = Parse.Object.extend("BusinessProfile");
        const query = new Parse.Query(BusinessProfile);
        query.equalTo("user",user);
        const profile = await query.first();
        if(profile){
            const logo = profile.get("logo");
            if(logo) invoiceBrandState.logoURL = logo.url();
            const name = profile.get("businessName");
            if(name) invoiceBrandState.businessName = name;
        }
    }catch(error){
        console.error("Loading invoice branding failed:",error);
    }
}

function applyInvoiceLogo(){
    const logo = $("invoiceLogo");
    if(!logo) return;
    logo.src = invoiceBrandState.logoURL || "logo.png";
}

function applyInvoiceBusinessName(){
    const companyName = $("invoiceCompanyName");
    if(companyName) companyName.textContent = invoiceBrandState.businessName;
}

function updateSectionUI(){
    sections.forEach(item=>{
        const button = $(item.button);
        const section = $(item.section);
        const badge = $(item.badge);
        const active = item.section === currentSectionId;
        if(button) button.classList.toggle("active",active);
        if(section) section.classList.toggle("active",active);
        if(badge) badge.style.display = active ? "block" : "none";
    });
    const selected = sections.find(item=>item.section===currentSectionId);
    const title = $("templateSettingsTitle");
    if(title && selected) title.textContent = selected.title;
}

async function activateSection(sectionId){
    const selected = sections.find(item=>item.section===sectionId);
    if(!selected || sectionId===currentSectionId && previewSection) {
        if(selected){
            previewSection = $(selected.section);
            updateSectionUI();
            refreshControls();
            applySettings();
        }
        return;
    }
    sectionSettings[currentSectionId] = {...templateSettings};
    currentSectionId = selected.section;
    previewSection = $(currentSectionId);
    updateSectionUI();
    setCurrentSettings(getSectionSettings(currentSectionId));
    refreshControls();
    applySettings();
    await loadTemplateFromCloud();
}

function setupSectionNavigation(){
    sections.forEach(item=>{
        const button = $(item.button);
        if(button){
            button.addEventListener("click",event=>{
                event.preventDefault();
                activateSection(item.section);
            });
        }
        const section = $(item.section);
        if(section){
            section.addEventListener("click",event=>{
                if(event.target.closest("a,button,input,select,textarea,label")) return;
                activateSection(item.section);
            });
        }
    });
}

function setupAccordions(){
    document.querySelectorAll(".settings-accordion").forEach(accordion=>{
        const header = accordion.querySelector(".settings-accordion-header");
        const body = accordion.querySelector(".settings-accordion-body");
        if(!header || !body) return;
        header.type = "button";
        header.setAttribute("aria-expanded","false");
        header.addEventListener("click",event=>{
            event.preventDefault();
            const isOpen = accordion.classList.contains("active");
            document.querySelectorAll(".settings-accordion").forEach(item=>{
                item.classList.remove("active");
                const itemBody = item.querySelector(".settings-accordion-body");
                const itemHeader = item.querySelector(".settings-accordion-header");
                if(itemBody) itemBody.style.display = "none";
                if(itemHeader) itemHeader.setAttribute("aria-expanded","false");
            });
            if(!isOpen){
                accordion.classList.add("active");
                body.style.display = "block";
                header.setAttribute("aria-expanded","true");
            }
        });
    });
}

function setMergedPreview(merged){
    const paper = $("invoicePaper");
    if(!paper) return;
    paper.classList.toggle("merged-preview",merged);
    const button = $("mergeSectionsButton");
    if(button){
        button.classList.toggle("active",merged);
        button.innerHTML = merged ? '<i class="ri-layout-grid-line"></i> Separate Sections' : '<i class="ri-pages-line"></i> Merge All';
        button.setAttribute("aria-pressed",merged ? "true" : "false");
    }
}

function setupMergeButton(){
    const button = $("mergeSectionsButton");
    const paper = $("invoicePaper");
    if(!button || !paper) return;
    button.addEventListener("click",event=>{
        event.preventDefault();
        setMergedPreview(!paper.classList.contains("merged-preview"));
    });
}

function setupControls(){
    setupMergeButton();
    connectSlider("headerBorderRadius","headerRadiusValue","borderRadius","px");
    connectSlider("headerPadding","headerPaddingValue","padding","px");
    connectSlider("headerMargin","headerMarginValue","marginBottom","px");
    connectSlider("headerOpacity","headerOpacityValue","opacity","%");
    connectSlider("headerFontSize","headerFontSizeValue","fontSize","px");
    connectSlider("headerLetterSpacing","headerLetterSpacingValue","letterSpacing","px");
    connectSlider("headerLineHeight","headerLineHeightValue","lineHeight","");
    connectSlider("sectionWidth","sectionWidthValue","width","%");
    connectSlider("borderWidth","borderWidthValue","borderWidth","px");
    connectSlider("shadowBlur","shadowBlurValue","shadowBlur","px");
    connectSlider("sectionZIndex","zIndexValue","zIndex","");

    connectSelect("headerFontFamily","fontFamily");
    connectSelect("headerFontWeight","fontWeight");
    connectSelect("headerTextTransform","textTransform");
    connectSelect("borderStyle","borderStyle");
    connectSelect("sectionAnimation","animation");
    connectSelect("sectionOverflow","overflow");

    connectSwitch("sectionShadow","shadowEnabled");
    connectSwitch("sectionBorder","borderEnabled");
    connectSwitch("sectionBorderEnabled","borderEnabled");
    connectSwitch("shadowEnabled","shadowEnabled");
    connectSwitch("toggleCompanyLogo","showLogo");
    connectSwitch("toggleCompanyInfo","showCompanyInfo");
    connectSwitch("toggleCustomerInfo","showCustomerInfo");
    connectSwitch("toggleInvoiceNumber","showInvoiceNumber");
    connectSwitch("toggleInvoiceDates","showInvoiceDates");
    connectSwitch("togglePaymentInfo","showPaymentInfo");
    connectSwitch("toggleNotes","showNotes");
    connectSwitch("toggleFooter","showFooter");
    connectSwitch("lockSection","locked");

    connectInput("customCssClass","customCssClass");

    connectColor("headerBackgroundColor","headerBackgroundHex","backgroundColor");
    connectColor("headerTextColor","headerTextHex","textColor");
    connectColor("headerAccentColor","headerAccentHex","accentColor");
    connectColor("borderColor","borderColorHex","borderColor");

    setupButtonGroup(["textAlignLeft","textAlignCenter","textAlignRight","textAlignJustify"],"textAlign");
    setupButtonGroup(["sectionAlignLeft","sectionAlignCenter","sectionAlignRight"],"sectionAlign");

    setupToggleButton("fontBoldButton","bold");
    setupToggleButton("fontItalicButton","italic");
    setupToggleButton("fontUnderlineButton","underline");
    setupToggleButton("fontStrikeButton","strike");

    const presetButtons = [
        ["presetModern","modern"],
        ["presetMinimal","minimal"],
        ["presetCorporate","corporate"],
        ["presetCreative","creative"]
    ];
    presetButtons.forEach(([id,name])=>{
        const button = $(id);
        if(button) button.addEventListener("click",event=>{
            event.preventDefault();
            loadPreset(name);
        });
    });

    if($("templateSaveButton")) $("templateSaveButton").addEventListener("click",event=>{
        event.preventDefault();
        saveTemplateToCloud();
    });

    if($("templateResetChangesButton")) $("templateResetChangesButton").addEventListener("click",event=>{
        event.preventDefault();
        resetTemplateSettings();
    });

    if($("templateCancelButton")) $("templateCancelButton").addEventListener("click",event=>{
        event.preventDefault();
        loadTemplateFromCloud();
    });

    if($("resetTemplateButton")) $("resetTemplateButton").addEventListener("click",event=>{
        event.preventDefault();
        resetTemplateFromCloud();
    });

    if($("restoreDefaultButton")) $("restoreDefaultButton").addEventListener("click",event=>{
        event.preventDefault();
        resetTemplateSettings();
    });
}

function setupColorCanvas(){
    canvas = $("headerColorCanvas");
    cursor = $("headerColorCursor");
    hueSlider = $("headerHueSlider");
    if(!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.width = 220;
    canvas.height = 220;
    drawColorCanvas(hueSlider ? hueSlider.value : 220);
    if(hueSlider) hueSlider.addEventListener("input",()=>drawColorCanvas(hueSlider.value));
    canvas.addEventListener("click",canvasPick);
    canvas.addEventListener("mousedown",event=>{
        dragging = true;
        canvasPick(event);
    });
    window.addEventListener("mousemove",event=>{
        if(dragging) canvasPick(event);
    });
    window.addEventListener("mouseup",()=>dragging=false);
    window.addEventListener("touchmove",event=>{
        if(!dragging || !event.touches[0]) return;
        canvasPick(event.touches[0]);
    },{passive:true});
    window.addEventListener("touchend",()=>dragging=false);
}

window.addEventListener("DOMContentLoaded",async()=>{
    sections.forEach(item=>{
        sectionSettings[item.section] = cloneDefaults();
    });

    previewSection = $(currentSectionId);
    setCurrentSettings(getSectionSettings(currentSectionId));

    setupSectionNavigation();
    setupAccordions();
    setupControls();
    setupColorCanvas();
    setupTemplateTransferControls();

    updateSectionUI();
    refreshControls();
    applySettings();

    visibilityInitialized = false;

    await loadInvoiceBranding();
    applyInvoiceLogo();
    applyInvoiceBusinessName();

    try{
        await loadAllInvoiceTemplatesFromCloud();
    }catch(error){
        console.error(
            "Unable to load all saved invoice template settings:",
            error
        );
    }

    previewSection = $(currentSectionId);
    setCurrentSettings(getSectionSettings(currentSectionId));
    dirtySections.clear();
    globalVisibilityDirty = false;

    updateSectionUI();
    refreshControls();
    applySettings();

    applyPendingTemplateTransfer();
});