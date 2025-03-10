import * as utility from "$lib/utility/utility";

export function applyToSelection(selection: Selection|null, command: string) {
    //utility.closeContextMenu();
    //const selection = window.getSelection();
    if (!selection || selection.rangeCount == 0) return;

    const range = selection.getRangeAt(0);

    let selectedTextDivs = [];
    let selectedContent = range.cloneContents();


    let textDivs = selectedContent.querySelectorAll('.text-div');
    for (let i = 0; i < textDivs.length; i++) {
        selectedTextDivs.push(document.getElementById(textDivs[i].id));
    }

    //alert(`Selected node length : ${selectedTextDivs.length}`)
    if (selectedTextDivs.length == 0){
        range.surroundContents(document.createElement('b'));
        return;
    }

    let getIndexOfVisibleChar = (code: string, charIndex: number) => {
        let index = 0;
        let count = 0;
        let isTag = false;
        while (index < code.length){
            if (count == charIndex){
                return index;
            }
            if (code[index] == "<"){
                isTag = true;
            } else if (code[index] == ">"){
                isTag = false;
            } else if (!isTag){
                count++;
            }

            index++;
        }
        if (count == charIndex){
            return index;
        }

        console.error("Index not found");
        return 0;
    }

    let getHTMLTagByCommand = (command: string, closing: Boolean = false) => {
        switch (command){
            case "bold": {
                return `<${closing ? '/' : ''}b>`;
            }
            case "italic": {
                return `<${closing ? '/' : ''}i>`;
            }
            default: {
                return `<${closing ? '/' : ''}p>`;
            }
        }
    }

    for (let i = 0; i < selectedTextDivs.length; i++) {
        let element = selectedTextDivs[i]!;
        if (element.className=="text-div"){
            const openingTag = getHTMLTagByCommand(command, false);
            const closingTag = getHTMLTagByCommand(command, true);
            if (i == 0){
                let index = getIndexOfVisibleChar(element.innerHTML, range.startOffset);
                //alert(`${range.startOffset}, ${index}`);
                element.innerHTML = `${element.innerHTML.slice(0, index)}${openingTag}${element.innerHTML.slice(index)}${closingTag}`;
            } else if (i == selectedTextDivs.length - 1){
                let index = getIndexOfVisibleChar(element.innerHTML, range.endOffset);
                element.innerHTML = `${openingTag}${element.innerHTML.slice(0, index)}${closingTag}${element.innerHTML.slice(index)}`;
            } else{
                element.innerHTML = `${openingTag}${element.innerHTML}${closingTag}`;
            }

        }
    }

    selection.removeAllRanges();

}

export function openSelectionMenu(){
    utility.closeContextMenu();
    const selection = window.getSelection();
    //alert(`Selection: ${selection.toString()}\nrangecount: ${selection.rangeCount}`)
    if (!selection || selection.rangeCount == 0 || selection.toString() == "") {
        return;
    }
    let menu = document.createElement('div');
    menu.classList.add("element-menu", "popup");
    const range = selection.getRangeAt(0);
    let rects = range.getClientRects();

    if (rects.length == 0) return;

    let min = rects[0].top;
    for (let rect of rects){
        if (rect.top < min) min = rect.top;
    }
    menu.style.left = rects[0].left + "px";
    menu.style.top = min + "px";

    //alert(`${menu.style.left}, ${menu.style.top}`)


    let button = document.createElement('button');
    button.innerHTML = "Bold";
    button.onclick = () => {
        applyToSelection(selection, "bold");
        utility.closeContextMenu();
    }


    menu.appendChild(button);

    document.body.appendChild(menu);
}