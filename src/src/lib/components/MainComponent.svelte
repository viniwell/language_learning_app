
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
    import * as SelectionHandler from "$lib/utility/selectionHandler";

    import * as utility from "$lib/utility/utility"

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



    function openElementMenu(event: MouseEvent, element: HTMLElement) {
        utility.closeContextMenu();

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

            utility.downloadBlob(blob, `${element.tagName.toLowerCase()}.html`)

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

                utility.downloadBlob(blob, `${parent.tagName.toLowerCase()}.html`)
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
                let closingTagPos = utility.findEquivalentClosingTag(code, i+1);
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
            utility.closeContextMenu();
        }
    })



    document.addEventListener("keyup", () => {
        setTimeout(SelectionHandler.openSelectionMenu, 0); // Ensures selection state is updated before checking
    });
    document.addEventListener("mouseup", (event: MouseEvent) => {
        if (event.button == 0){
            setTimeout(SelectionHandler.openSelectionMenu, 0); // Ensures selection state is updated before checking
        }

    });
</script>





<!--<div id="mainDiv" bind:this={mainDiv}}>
    {text}
</div>-->
