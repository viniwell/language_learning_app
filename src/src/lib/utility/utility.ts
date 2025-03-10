export function downloadBlob(blob: Blob, filename: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function closeContextMenu(){
    const popups = document.getElementsByClassName("popup");
    for (const popup of popups) popup.remove();
}


export function findEquivalentClosingTag(str: string, start: number): number {
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