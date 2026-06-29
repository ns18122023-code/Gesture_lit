async function getCurrentPageText(){
    if(!pdfDoc){
        alert("PDF not loaded yet");
        return "";
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
        .map(item => item.str)
        .join(" ");

    return pageText;
}

async function summarizeCurrentPage(){
    const text = await getCurrentPageText();

    if(text.trim() === ""){
        alert("No text found on this page");
        return;
    }

    const sentences = text.split(".");
    const summary = sentences.slice(0, 3).join(".") + ".";

    document.getElementById("aiResult").innerText =
        "Summary:\n" + summary;
}

async function translateCurrentPage(){

    const text = await getCurrentPageText();

    if(text.trim() === ""){
        alert("No text found on this page");
        return;
    }

    const language = prompt(
        "Enter language code:\n\nhi = Hindi\nen = English\nfr = French\nes = Spanish\nur = Urdu\npa = Punjabi"
    );

    if(!language){
        return;
    }

    document.getElementById("aiResult").innerText =
        "Translating... Please wait.";

    try{
        const response = await fetch(
            "https://api.mymemory.translated.net/get?q=" +
            encodeURIComponent(text.slice(0, 500)) +
            "&langpair=en|" + language.toLowerCase()
        );

        const data = await response.json();

        document.getElementById("aiResult").innerText =
            `Translated:\n\n${data.responseData.translatedText}`;

    }catch(error){
        console.log(error);
        document.getElementById("aiResult").innerText =
            "Translation failed. Check internet connection.";
    }
}

async function speakCurrentPage(){
    const text = await getCurrentPageText();

    if(text.trim() === ""){
        alert("No text found on this page");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);

    document.getElementById("aiResult").innerText =
        "Reading current page aloud...";
}

function stopSpeech(){
    window.speechSynthesis.cancel();

    document.getElementById("aiResult").innerText =
        "Speech stopped.";
}
function addHighlight(){
    const note = prompt("Enter highlight/note for this page:");

    if(!note) return;

    let highlights = JSON.parse(localStorage.getItem("highlights")) || [];

    highlights.push({
        book: book,
        page: pageNum,
        note: note,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("highlights", JSON.stringify(highlights));

    document.getElementById("aiResult").innerText =
        "Highlight saved for page " + pageNum;
}

function showHighlights(){
    const highlights = JSON.parse(localStorage.getItem("highlights")) || [];

    const currentHighlights = highlights.filter(item =>
        item.book === book && item.page === pageNum
    );

    if(currentHighlights.length === 0){
        document.getElementById("aiResult").innerText =
            "No highlights on this page.";
        return;
    }

    document.getElementById("aiResult").innerHTML =
        currentHighlights.map(item =>
            `Page ${item.page}: ${item.note}<br><small>${item.date}</small><hr>`
        ).join("");
}