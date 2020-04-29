document.addEventListener("DOMContentLoaded", function() {

    let requestURL = 'https://whatruska.github.io/Bars_Group_Test/app/lpu.json';

    let table = document.getElementById("table");
    let deleteBtn = document.getElementById("delete");
    let clearBtn = document.getElementById("clear");
    let addBtn = document.getElementById("add");
    let hostBtn = document.getElementById("host");
    let fileBtn = document.getElementById("file");
    let body = document.getElementsByTagName("body").item(0);
    let header = document.getElementsByTagName("header").item(0);
    let main = document.getElementsByTagName("main").item(0);
    let container = document.getElementById("container");
    let selectedRow = [];
    let vertInd = 0;

    class Storage {
        storage = {}

        constructor() {
            this.storage = window.localStorage;
        }

        getItem = (key) => {
            return window.localStorage.getItem(key);
        };

        names = {};
        phones = {};
        addresses = {};

        setNames = (n) => {
            this.names = n;
        }

        setPhones = (p) => {
            this.phones = p;
        }

        setAddresses = (a) => {
            this.addresses = a;
        }

        refreshStorage = () => {
            this.storage.setItem("names", JSON.stringify(this.names));
            this.storage.setItem("phones", JSON.stringify(this.phones));
            this.storage.setItem("addresses", JSON.stringify(this.addresses));
        }

        updateStorage = (newValue, type, row) => {
            switch (type) {
                case "full_name" : {
                    let phone = getPhone(row);
                    this.phones[phone] = newValue;
                    break;
                }

                case "address" : {
                    let name = getCompanyName(row);
                    this.names[name] = newValue;
                    break;
                }

                case "phone" : {
                    let address = getAddress(row);
                    this.addresses[address] = newValue;
                    break;
                }
            }

            this.refreshStorage();
        }

        isUnique = (type, text) => {
            switch (type) {
                case "full_name" :{
                    return !Boolean(this.names[text]);
                    break;
                }

                case "phone" : {
                    return !Boolean(this.phones[text]);
                    break;
                }

                case "address" : {
                    return !Boolean(this.addresses[text]);
                    break;
                }
            }
        }

        updateNameByPhone = (phone, name) => {
            this.phones[phone] = name;
        }

        updateAddressByName = (name, address) => {
            this.names[name] = address;
        }

        updatePhoneByAddress = (address, phone) => {
            this.addresses[address] = phone;
        }

        addNewRecord = (name, phone, address) => {
            storage.updateNameByPhone(phone, name);
            storage.updateAddressByName(name, address);
            storage.updatePhoneByAddress(address, phone);
            storage.refreshStorage();
        }

        deleteData = (row) => {
            delete this.phones[getPhone(row)];
            delete this.addresses[getAddress(row)];
            delete this.names[getCompanyName(row)];
        }

        clean = () => {
            window.localStorage.clear();
            this.setNames({});
            this.setPhones({});
            this.setAddresses({});
            this.refreshStorage();
        }
    }

    class Element {
        constructor(type) {
            return document.createElement(type)
        }

        static setClass = (elem, className) => {
            elem.setAttribute("class", className);
        }

        static setId = (elem, id) => {
            elem.setAttribute("id", id);
        }

        static setPlaceholder = (elem, placeholder) => {
            elem.setAttribute("placeholder", placeholder);
        }
    }

    let storage = new Storage();

    fileBtn.onchange = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function(event) {
            let contents = event.target.result;
            let data = JSON.parse(contents);
            storage.clean();
            console.log(storage)
            data.forEach((obj) => {
                let name = obj["full_name"];
                let phone = obj["phone"];
                let address = obj["address"];
                storage.addNewRecord(name,phone,address);
            });
            let rows = table.getElementsByTagName("tr");
            for (let i = rows.length - 1; i > 0; i--){
                table.removeChild(rows.item(i));
            }
            buildTableFromStorage();
        };

        reader.onerror = function(event) {
            console.error("Файл не может быть прочитан! код " + event.target.error.code);
        };

        reader.readAsText(file);
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
                storage.deleteData(row);
                storage.refreshStorage();
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

    let handleAddSubmit = (e, modal) => {
        e.preventDefault();
        let isValid = true;
        let inputs = modal.getElementsByTagName("input");
        let data = {};
        for (let i = 0; i < inputs.length; i++){
            let input = inputs.item(i);
            let key = input.getAttribute("id");
            let text = input.value;
            let error = new Element("span");
            Element.setClass(error, "error");
            let spans = modal.getElementsByTagName("span");
            input.style.borderColor = "black";
            if (spans.length > 1){
                modal.removeChild(spans.item(spans.length - 1));
            }
            if (text.length === 0){
                isValid = false;
                error.innerText = ("Empty field");
                input.style.borderBottomColor = "red";
                modal.appendChild(error);
                break;
            } else if (!storage.isUnique(key, text)) {
                isValid = false;
                error.innerText = (key.charAt(0).toUpperCase() + key.substring(1) + " is not unique");
                input.style.borderBottomColor = "red";
                modal.appendChild(error);
                break;
            } else {
                data[key] = text;
            }
        }
        if (isValid){
            if (storage.getItem("addresses").length === 0) hideEmptySlide();
            storage.addNewRecord(data["full_name"], data["phone"], data["address"]);
            storage.refreshStorage();
            createRow({
                full_name: data['full_name'],
                phone: data['phone'],
                address: data['address']
            })
            hideModal(e, modal);
        }
    }

    addBtn.onclick = (e) => {
        let modal = new Element("div");
        Element.setClass(modal,'modal');

        let form = new Element("form");
        let span = new Element("span");

        Element.setClass(span,"heading");
        span.innerText = ("Add new info");

        form.appendChild(span);

        let input = new Element("input");
        Element.setId(input, "full_name");
        Element.setPlaceholder(input,"Name");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        input = new Element("input");
        Element.setId(input,"phone");
        input.setAttribute("type","phone");
        Element.setPlaceholder(input,"Phone");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        input = new Element("input");
        Element.setId(input,"address");
        Element.setPlaceholder(input,"Address");
        input.setAttribute("autocomplete","off");
        form.appendChild(input);
        form.focus();
        form.onmouseleave = (e) => {
            hideModal(e, modal);
        }
        let button = new Element("button");
        button.innerText = ("Add");
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
        if (container.getElementsByTagName("table").length === 1){
            container.removeChild(table);
            let slide = document.createElement("div");
            let h2 = document.createElement("h2");
            slide.appendChild(h2);
            h2.innerText = "There`s no info... Add some!";
            container.appendChild(slide);
            deleteBtn.setAttribute("disabled","");
            clearBtn.setAttribute("disabled","");
        }
    }

    let hideEmptySlide = () => {
        if (container.getElementsByTagName("div").length !== 0){
            container.removeChild(container.getElementsByTagName("div").item(0));
            container.appendChild(table);
        }
    }

    let getRow = (vertInd) => {
        return table.getElementsByTagName("tr")[parseInt(vertInd) + 1];
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

    let handleBlur = (e,horIndex, vertIndex) => {
        let input = e.target;
        let row = getRow(vertIndex);
        let parent = getColumnInRow(row, horIndex);
        let newText = input.value;
        let key = parent.getAttribute("key");
        if (newText.length > 0){
            storage.updateStore(newText, key, row);
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

    let uploadJson = () => fetch(requestURL).then((response) => response.json()).then((data) => {
        data.forEach(elem => {
            let address = elem['address'];
            let phone = elem['phone'];
            let fullName = elem['full_name'];
            createRow(elem);
            storage.addNewRecord(fullName, phone, address);
        });
        storage.refreshStorage();
        window.location.reload();
    });

    let buildTableFromStorage = () => {

        hideEmptySlide();
        let names = JSON.parse(storage.getItem("names"));
        if (names === null){
            names = {};
        }
        storage.setNames(names);
        let phones = JSON.parse(storage.getItem("phones"));
        if (phones === null){
            phones = {};
        }
        storage.setPhones(phones);
        let addresses = JSON.parse(storage.getItem("addresses"));
        if (addresses === null) {
            addresses = {};
        }
        storage.setAddresses(addresses);
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
        if (vertInd === 0 || storage.length === 0) showEmptySlide();
    }

    let loadTestData = (e) => {
        e.preventDefault();
        let rows = table.getElementsByTagName("tr");
        if (rows.length === 1){
            showEmptySlide();
        } else if (rows.length > 1) {
            for (let i = 1; i < rows.length; i++){
                table.removeChild(rows.item(i));
            }
        }
        hideEmptySlide();
        uploadJson();
    }


    hostBtn.onclick = loadTestData;

    buildTableFromStorage();
});
