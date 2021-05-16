let codeArea;               // your code goes here (or error mesage etc.)
let langInput;              // language?
let formatButton;           // "code formatter"
let copyCheckbox;           // copy to clipboard?
let resultArea;             // place the result here

function setup() {
    // nothing colorful
    noCanvas();

    // top-left header
    createElement("h3", "Kodunuzu veya hata mesajınızı buraya yapıştırın").position(5, 0);

    // input text area
    // width = height = 600 -> (20, 50) => (620, 650)
    codeArea = createElement("textarea");
    codeArea.position(20, 50);

    // writing a language (or something similar)
    langInput = createInput("python");
    langInput.position(660, 310);
    langInput.size(100);
    langInput.changed(formatCode);

    // ask copying to clipboard
    copyCheckbox = createCheckbox("Panoya kopyala", true);
    copyCheckbox.position(660, 340);

    // action button
    formatButton = createButton("Format");
    formatButton.position(660, 370);
    formatButton.mousePressed(formatCode);

    // output text area
    resultArea = createElement("textarea");
    resultArea.position(20+600+200, 50);
}

function formatCode(event) {
    /*
    Really "format" the code here: ```$lang ... ```
    */
    // get the trimmed input text and language of choice
    const code = trim(codeArea.value());
    const lang = langInput.value();

    // "format"
    const threeBackticks = "```";
    const result = `${threeBackticks}${lang}\n${code}\n${threeBackticks}`;

    // output the result
    resultArea.value(result);

    // copy to clipboard?
    if (copyCheckbox.checked()) {
        resultArea.elt.focus();
        resultArea.elt.select();
        const successful = document.execCommand("copy");
        
        alert(successful ? "kopyalandı" : "kopyalanamadı");
    }
}
