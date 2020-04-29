

document.addEventListener("DOMContentLoaded", function() {

    let requestURL = 'https://whatruska.github.io/Bars_Group_Test/app/lpu.json';

    let storage = window.localStorage;
    let table = document.getElementById("table");
    let deleteBtn = document.getElementById("delete");
    let clearBtn = document.getElementById("clear");
    let addBtn = document.getElementById("add");
    let body = document.getElementsByTagName("body").item(0);
    let header = document.getElementsByTagName("header").item(0);
    let main = document.getElementsByTagName("main").item(0);
    let container = document.getElementById("container");
    let selectedRow = [];
    let names = {};
    let phones = {};
    let addresses = {};
    let vertInd = 0;

    let refreshStorage = () => {
        storage.setItem("names", JSON.stringify(names));
        storage.setItem("phones", JSON.stringify(phones));
        storage.setItem("addresses", JSON.stringify(addresses));
    }

    let setClass = (elem, className) => {
        elem.setAttribute("class", className);
    }

    let setId = (elem, id) => {
        elem.setAttribute("id", id);
    }

    let setPlaceholder = (elem, placeholder) => {
        elem.setAttribute("placeholder", placeholder);
    }

    let clear = (e) => {
        selectedRow = [];
        let rows = table.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++){
            let row = rows.item(i);
            row.removeAttribute("style");
            row.removeAttribute("selected");
        }
    }

    clearBtn.onclick = (e) => {
        clear(e);
    }

    deleteBtn.onclick = (e) => {
        selectedRow = [];
        let rowsToDelete = [];
        let rows = table.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++){
            let row = rows.item(i);
            if (row.getAttribute("selected") !== null){
                rowsToDelete.push(row);
                delete phones[getPhone(row)];
                delete addresses[getAddress(row)];
                delete names[getCompanyName(row)];
                refreshStorage();
            }
        }
        rowsToDelete.forEach((elem) => {
            table.removeChild(elem);
        });
        if (rows.length === 1) showEmptySlide();
    }

    let hideModal = (e, modal) => {
        body.removeChild(modal);
        main.style.filter = "";
        header.style.filter = "";
    }

    /*

    phone -> name
    name -> address
    address -> phone

    */

    let isUnique = (type, text) => {
        console.log(type)
        console.log(text)
        switch (type) {
            case "full_name" :{
                console.log(Boolean(names[text]))
                return !Boolean(names[text]);
                break;
            }

            case "phone" : {
                console.log(Boolean(phones[text]))
                return !Boolean(phones[text]);
                break;
            }

            case "address" : {
                console.log(Boolean(addresses[text]))
                return !Boolean(addresses[text]);
                break;
            }
        }
    }

    let handleAddSubmit = (e, modal) => {
        e.preventDefault();
        let isValid = true;
        let inputs = modal.getElementsByTagName("input");
        let data = {};
        for (let i = 0; i < inputs.length; i++){
            let input = inputs.item(i);
            let key = input.getAttribute("id");
            let text = input.value;
            let error = document.createElement("span");
            let spans = modal.getElementsByTagName("span");
            input.style.borderColor = "black";
            if (spans.length > 1){
                modal.removeChild(spans.item(spans.length - 1));
            }
            if (text.length === 0){
                isValid = false;
                setClass(error, "error");
                error.innerText = "Empty field"
                input.style.borderBottomColor = "red";
                modal.appendChild(error);
                break;
            } else if (!isUnique(key, text)) {
                isValid = false;
                setClass(error, "error");
                error.innerText = key.charAt(0).toUpperCase() + key.substring(1) + " is not unique"
                input.style.borderBottomColor = "red";
                modal.appendChild(error)
                break;
            } else {
                data[key] = text;
            }
        }
        if (isValid){
            if (addresses.length === 0) hideEmptySlide();
            phones[data["phone"]] = data["full_name"]
            names[data["full_name"]] = data["address"]
            addresses[data["address"]] = data["phone"]
            refreshStorage();
            createRow({
                full_name: data['full_name'],
                phone: data['phone'],
                address: data['address']
            })
            hideModal(e, modal);
        }
    }

    addBtn.onclick = (e) => {
        let modal = document.createElement("div");
        setClass(modal, "modal");

        let form = document.createElement("form");
        let span = document.createElement("span");

        setClass(span, "heading")
        span.innerText = "Add new info"

        form.appendChild(span);

        let input = document.createElement("input");
        setId(input, "full_name");
        setPlaceholder(input, "Name");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        input = document.createElement("input");
        setId(input, "phone");
        input.setAttribute("type","phone");
        setPlaceholder(input, "Phone");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        input = document.createElement("input");
        setId(input, "address");
        setPlaceholder(input, "Address");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        form.focus();
        form.onmouseleave = (e) => {
            hideModal(e, modal);
        }
        let button = document.createElement("button");
        button.innerText = "Add"
        button.onclick = (e) => handleAddSubmit(e, modal)

        form.appendChild(button);

        modal.appendChild(form);

        main.style.transition = "0.7s all linear";
        main.style.filter = "blur(10px)"

        header.style.transition = "0.7s all linear";
        header.style.filter = "blur(10px)"

        body.appendChild(modal);
    }

    let showEmptySlide = () => {
        container.removeChild(table);
        let slide = document.createElement("div");
        let h2 = document.createElement("h2");
        slide.appendChild(h2);
        h2.innerText = "There`s no info... Add some!";
        container.appendChild(slide);
        deleteBtn.setAttribute("disabled","");
        clearBtn.setAttribute("disabled","");
    }

    let hideEmptySlide = () => {
        container.removeChild(container.getElementsByTagName("div").item(0));
        container.appendChild(table);
    }

    let getRow = (vertInd) => {
        return table.getElementsByTagName("tr")[parseInt(vertInd) + 1];
    }

    let getProperty = (vertIndex, horIndex) => {
        return getRow(vertInd).getElementsByTagName("td")[horIndex].innerText;
    }

    let getColumnInRow = (row, horInd) => {
        return row.getElementsByTagName("td")[horInd];
    }

    let getCompanyName = (row) => {
        return getColumnInRow(row, 0).innerText;
    }

    let getAddress = (row) => {
        return getColumnInRow(row, 2).innerText;
    }

    let getPhone = (row) => {
        return getColumnInRow(row, 1).innerText;
    }

    /*

        phone -> name
        name -> address
        address -> phone

    */

    let updateStore = (newValue, type, row) => {
        switch (type) {
            case "full_name" : {
                let phone = getPhone(row);
                phones[phone] = newValue;
                break;
            }

            case "address" : {
                let name = getCompanyName(row);
                names[name] = newValue;
                break;
            }

            case "phone" : {
                let address = getAddress(row);
                addresses[address] = newValue;
                break;
            }
        }

        refreshStorage();
    }

    let handleBlur = (e,horIndex, vertIndex) => {
        let input = e.target;
        let row = getRow(vertIndex);
        let parent = getColumnInRow(row, horIndex);
        let newText = input.value;
        let key = parent.getAttribute("key");
        if (newText.length > 0){
            updateStore(newText, key, row);
            parent.removeChild(input);
            parent.innerText = newText;
        }
    }

    let handleDoubleClick = (e) => {
        clear(e);
        let target = e.target;
        let vertInd = target.getAttribute("vertIndex");
        let horInd = target.getAttribute("horIndex");

        let input = document.createElement("input");
        input.value = target.innerText;

        input.onblur = (e) => {
            handleBlur(e, horInd, vertInd);
        }
        target.innerText = ""
        target.appendChild(input);
        input.focus();
    }

    let handleClick = (e) => {
        let target = e.currentTarget;
        let selected = target.getAttribute("selected");
        let style = target.style;
        let vertIndex = target.getElementsByTagName("td")[0].getAttribute("vertIndex");
        if (selected === null){
            style.backgroundColor = "#89099c";
            style.color = "white"
            target.setAttribute("selected","");
            selectedRow.push(vertIndex);
        } else {
            style.backgroundColor = "transparent";
            style.color = "black"
            target.removeAttribute("selected");
            selectedRow = selectedRow.filter(el => el !== vertIndex);
        }
    }

    let createRow = (data) => {
        let row = document.createElement("tr");
        row.onclick = (e) => {
            handleClick(e);
        }
        let keys = Object.keys(data);
        keys.forEach((key, index) => {
            let td = document.createElement("td");
            td.innerText = data[key];
            td.setAttribute("horIndex", index);
            td.setAttribute("vertIndex", vertInd);
            td.setAttribute("key", key);
            td.ondblclick = (e) => {
                handleDoubleClick(e);
            }
            row.appendChild(td);
        });
        table.appendChild(row);
        vertInd++;
    }

    /*

    phone -> name
    name -> address
    address -> phone

    */

    let uploadJson = () => fetch(requestURL).then((response) => response.json()).then((data) => {
        storage.clear();
        data.forEach(elem => {
            console.log(elem)
            let address = elem['address'];
            let phone = elem['phone'];
            let fullName = elem['full_name'];

            phones[phone] = fullName;
            names[fullName] = address;
            addresses[address] = phone;

            refreshStorage();
            createRow(elem);
        });
    });

    let buildTableFromStorage = () => {
        names = JSON.parse(storage.getItem("names"));
        phones = JSON.parse(storage.getItem("phones"));
        addresses = JSON.parse(storage.getItem("addresses"));
        let keys = Object.keys(addresses);
        for (let i = 0; i < keys.length; i++){
            let address = keys[i];
            let phone = addresses[address];
            let fullname = phones[phone];
            createRow({
                full_name : fullname,
                phone : phone,
                address : address
            });
        }
        if (vertInd === 0) showEmptySlide();
    }

    //uploadJson();
    buildTableFromStorage();
});
