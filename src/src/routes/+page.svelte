
<svelte:head>
    <style>
        body {
            position: relative;
        }
        table {
            width: 50%;
            border-collapse: collapse;
            margin: 20px auto;
            font-family: Arial, sans-serif;
            user-select: text;
        }
        th, td {
            border: 1px solid black;
            padding: 10px;
            text-align: center;
        }
        th {
            background-color: #f4f4f4;
        }
        .text-div {
            display: inline-block;
            margin-right: 2px;
        }
        .element-menu {
            position: absolute;
            background-color: #f4f4f4;
            border: 1px solid #ccc;
            padding: 10px;
            z-index: 1;
            user-select: none;
        }
        .selection-menu {
            position: absolute;
            background-color: #f4f4f4;
            border: 1px solid #ccc;
            padding: 10px;
            z-index: 1;
            user-select: none;
        }
    </style>
</svelte:head>

<script lang="ts">
    //import { invoke } from '@tauri-apps/api/tauri'

    let lastId = 0;

    let text = "some text <i>Hello <b>world</b></i> regular text <table>\n" +
        "        <thead>\n" +
        "            <tr>\n" +
        "                <th>ID</th>\n" +
        "                <th>Name</th>\n" +
        "                <th>Score</th>\n" +
        "            </tr>\n" +
        "        </thead>\n" +
        "        <tbody>\n" +
        "            <tr>\n" +
        "                <td>1</td>\n" +
        "                <td>Alice</td>\n" +
        "                <td>85</td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td>2</td>\n" +
        "                <td>Bob</td>\n" +
        "                <td>90</td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td>3</td>\n" +
        "                <td>Charlie</td>\n" +
        "                <td>78</td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td>4</td>\n" +
        "                <td>David</td>\n" +
        "                <td>92</td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td>5</td>\n" +
        "                <td>Eve</td>\n" +
        "                <td>88</td>\n" +
        "            </tr>\n" +
        "        </tbody>\n" +
        "    </table>";

    function downloadBlob(blob: Blob, filename: string) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function findEquivalentClosingTag(str: string, start: number): number {
        let open = 1;
        let closed = 0;


        if (start >= str.length){ return -1; }

        let i = start;
        while (i < str.length){
            if (str[i] == "<"){
                if (str[i+1] == "/"){
                    closed++;
                }else { open++; }


                if (open == closed){
                    return str.indexOf(">", i+1);
                }
            }
            i++;
        }
        return -1;
    }


    function openElementMenu(event: MouseEvent, element: HTMLElement) {
        closeContextMenu();

        event.preventDefault();
        if (event.cancelable){
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        let menu = document.createElement('div');
        menu.classList.add("element-menu", "popup");
        menu.style.left = event.clientX + "px";
        menu.style.top = event.clientY + "px";

        let exportButton = document.createElement('button');
        exportButton.innerHTML = "Export";
        exportButton.onclick = () => {
            if (element.classList.contains("text-div") && element.parentElement!.tagName != "BODY"){
                element = element.parentElement!;
            }

            let code = element.outerHTML;
            const blob = new Blob([document.getElementsByTagName("style")[0].outerHTML, code], { type: "text/html" });

            downloadBlob(blob, `${element.tagName.toLowerCase()}.html`)

            menu.remove();
        }

        if (["THEAD", "TBODY", "TR", "TH", "TD"].includes(element.tagName)){

            let exportParentButton = document.createElement('button');
            exportParentButton.innerHTML = "Export parent table";

            let parent = element;
            while (parent.tagName != "TABLE"){
                parent = parent.parentElement!;
            }
            exportParentButton.onclick = () => {
                let code = parent.outerHTML;
                const blob = new Blob([document.getElementsByTagName("style")[0].outerHTML, code], { type: "text/html" });

                downloadBlob(blob, `${parent.tagName.toLowerCase()}.html`)
            }
            menu.appendChild(exportParentButton);
        }

        menu.appendChild(exportButton);
        document.body.appendChild(menu);
    }


    function createElements(code: string, parent: HTMLElement): void {

        let i=0;

        let regularText = "";
        while (i < code.length) {
            if (code[i] == '<'){
                if (regularText.trim() != "") {
                    /*parent.innerHTML += regularText;*/
                    let textDiv = document.createElement("div");
                    textDiv.id = `${lastId}`;
                    lastId++;
                    textDiv.innerHTML = regularText;

                    //textDiv.addEventListener('select')
                    textDiv.classList.add("text-div");
                    parent.appendChild(textDiv);
                    regularText = "";
                }
                let childElement = document.createElement(code.slice(i+1, code.indexOf(">", i+1)));
                childElement.id = `${lastId}`;
                lastId++;
                let closingTagPos = findEquivalentClosingTag(code, i+1);
                createElements(code.slice(i+childElement.tagName.length+2, closingTagPos-childElement.tagName.length-2), childElement);
                parent.appendChild(childElement);
                i = closingTagPos;
            } else{
                regularText += code[i];
            }

            i+=1;
        }

        if (regularText.trim() != "") {
            //parent.innerHTML += regularText;
            let textDiv = document.createElement("div");
            textDiv.id = `${lastId}`;
            lastId++;
            textDiv.innerHTML = regularText;
            textDiv.classList.add("text-div");
            parent.appendChild(textDiv);
            regularText = "";
        }

    }

    function closeContextMenu(){
        const popups = document.getElementsByClassName("popup");
        for (const popup of popups) popup.remove();
    }




    createElements(text, document.body);
    document.addEventListener('contextmenu', (event) => {
        let element = event.target as HTMLElement;
        if (["HTML", "BODY"].includes(element.tagName)){
            return;
        }
        openElementMenu(event, element);
    })

    document.addEventListener('click', (event: MouseEvent) => {
        if (event.target === document.body){
            closeContextMenu();
        }
    })

    function applyToSelection(selection: Selection|null, command: string) {
        //closeContextMenu();
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

    function openSelectionMenu(){
        closeContextMenu();
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
        for (let rect in rects){
            if (rect.top < min) min = rect.top;
        }
        menu.style.left = rects[0].left + "px";
        menu.style.top = min + "px";

        //alert(`${menu.style.left}, ${menu.style.top}`)


        let button = document.createElement('button');
        button.innerHTML = "Bold";
        button.onclick = () => {
            applyToSelection(selection, "bold");
            closeContextMenu();
        }


        menu.appendChild(button);

        document.body.appendChild(menu);
    }


    document.addEventListener("keyup", () => {
        setTimeout(openSelectionMenu, 0); // Ensures selection state is updated before checking
    });
    document.addEventListener("mouseup", () => {
        setTimeout(openSelectionMenu, 0); // Ensures selection state is updated before checking
    });
</script>






<!--<div id="mainDiv" bind:this={mainDiv}}>
    {text}
</div>-->
