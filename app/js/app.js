"use strict"
document.addEventListener("DOMContentLoaded", function() {

    let requestURL = 'https://whatruska.github.io/Bars_Group_Test/app/lpu.json';

    let table = document.getElementById("table");
    let rows = table.getElementsByClassName("table-row");

    let body = document.getElementsByTagName("body").item(0);
    let header = document.getElementsByTagName("header").item(0);
    let main = document.getElementsByTagName("main").item(0);
    let container = document.getElementById("container");

    let deleteBtn = document.getElementById("delete");
    let clearBtn = document.getElementById("clear");
    let addBtn = document.getElementById("add");
    let hostBtn = document.getElementById("host");
    let fileBtn = document.getElementById("file");
    let downloadBtn = document.getElementById("download");

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
            let primaryMap = {};
            let secondaryMap = {};
            let primaryField = "";
            let secondaryField = "";
            switch (type) {
                case "full_name" : {
                    secondaryMap = this.phones;
                    primaryField = getPhone(row);
                    primaryMap = this.names;
                    secondaryField = getAddress(row);
                    break;
                }

                case "address" : {
                    secondaryMap = this.names;
                    primaryField = getFullName(row);
                    primaryMap = this.addresses;
                    secondaryField = getPhone(row);
                    break;
                }

                case "phone" : {
                    secondaryMap = this.addresses;
                    primaryField = getAddress(row);
                    secondaryField = getFullName(row);
                    primaryMap = this.phones;
                    break;
                }
            }

            secondaryMap[primaryField] = newValue;
            for (let key in primaryMap){
                if (primaryMap[key] === secondaryField){
                    delete primaryMap[key];
                    primaryMap[newValue] = secondaryField;
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
            delete this.names[getFullName(row)];
        }

        clean = () => {
            window.localStorage.clear();
            this.setNames({});
            this.setPhones({});
            this.setAddresses({});
            this.refreshStorage();
        }

        getData = () => {
            let allData = [];
            for (let address in this.addresses){
                let phone = this.addresses[address];
                let full_name = this.phones[phone];
                allData.push({
                    full_name : full_name,
                    phone : phone,
                    address : address
                });
            }
            return JSON.stringify(allData);
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

    let pallete = {
        //BARS GROUP BRAND DESIGN
        brand_black: "#4F4949",
        brand_green: "#A1C527",
        brand_red: "#D74738",
        brand_yellow: "#F4CB23",
        brand_blue: "#5CB3E5",

        //UI COLORS
        primary: "#52A8B6",
        secondary: "#DCDEE1",
        gray: "#AEB4BB",
        gray_dark: "#66717F",
        gray_dark_bg: "#1D2734",
        gray_bg: "#F4F6F9",
        green: "#7AC1D0",
        green_light: "#BBE4EA",
        red : "#F27171",
        yellow: "#F2D30C",
        blue: "#5585B5",

        // TEXT COLORS
        text: "#1D2734",
        text_secondary: "#66717F",
        text_light: "#AEB4BB",

        //BACKGROUND
        bg_light: "#F4F6F9",
        bg_dark: "#1D2734"
    }

    let storage = new Storage();

    let downloadFile = (filename) => {
        let element = document.createElement('a');
        let text = storage.getData();
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    let clearTable = () => {
        for (let i = rows.length - 1; i > 0; i--){
            table.removeChild(rows.item(i));
        }
    }

    let clearSelected = (e) => {
        selectedRow = [];
        for (let i = 1; i < rows.length; i++){
            let row = rows.item(i);
            row.removeAttribute("selected");
            row.style.backgroundColor = pallete.bg_light;
        }
        checkDisabled();
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
            if (spans.length > 1){
                modal.removeChild(spans.item(spans.length - 1));
            }
            if (text.length === 0){
                isValid = false;
                error.innerText = ("Empty field");
                input.setAttribute("error" , "");
                modal.appendChild(error);
                break;
            } else if (!storage.isUnique(key, text)) {
                isValid = false;
                error.innerText = (key.charAt(0).toUpperCase() + key.substring(1) + " is not unique");
                input.setAttribute("error" , "");
                modal.appendChild(error);
                break;
            } else {
                data[key] = text;
                input.style.borderColor = pallete.primary;
            }
        }
        if (isValid){
            hideEmptySlide();
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

    let showEmptySlide = () => {
        if (container.getElementsByTagName("div").length === 5){
            container.removeChild(table);
            let slide = document.createElement("div");
            Element.setId(slide, "slide");
            slide.style.color = pallete.text;
            let h2 = document.createElement("h2");
            slide.appendChild(h2);
            h2.innerText = "There`s no info... Add some!";
            container.appendChild(slide);
            deleteBtn.setAttribute("disabled","");
            clearBtn.setAttribute("disabled","");
        }
    }

    let hideEmptySlide = () => {
        let slide = document.getElementById("slide");
        if (slide){
            container.removeChild(slide);
            container.appendChild(table);
        }
    }

    let getRow = (vertInd) => {
        return rows[parseInt(vertInd) + 1];
    }

    let getColumnInRow = (row, horInd) => {
        return row.getElementsByTagName("div")[horInd];
    }

    let getFullName = (row) => {
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
            storage.updateStorage(newText, key, row);
            parent.removeChild(input);
            parent.innerText = newText;
        }
        checkDisabled()
    }

    let handleDoubleClick = (e) => {
        clearSelected(e);
        checkDisabled()
        let target = e.target;
        let vertInd = target.getAttribute("vertIndex");
        let horInd = target.getAttribute("horIndex");

        let input = document.createElement("input");
        let style = input.style;
        input.value = target.innerText;
        style.backgroundColor = "transparent";
        style.borderBottomColor = pallete.text;
        style.color = pallete.text;

        input.onblur = (e) => {
            handleBlur(e, horInd, vertInd);
        }
        target.innerText = ""
        target.appendChild(input);
        input.focus();
    }

    let checkDisabled = (e) => {
        if (selectedRow.length === 0){
            deleteBtn.setAttribute("disabled","");
            clearBtn.setAttribute("disabled","");
        } else {
            deleteBtn.removeAttribute("disabled");
            clearBtn.removeAttribute("disabled");
        }
    }

    let handleClick = (e) => {
        let target = e.currentTarget;
        let selected = target.getAttribute("selected");
        let style = target.style;
        style.color = pallete.text;
        let vertIndex = target.getElementsByTagName("div")[0].getAttribute("vertIndex");
        if (selected === null){
            style.backgroundColor = pallete.green;
            target.setAttribute("selected","");
            selectedRow.push(vertIndex);
        } else {
            style.backgroundColor = pallete.bg_light;
            let r = [...rows];
            target.removeAttribute("selected");
            selectedRow = selectedRow.filter(el => el !== vertIndex);
        }
        checkDisabled();
    }

    let createRow = (data) => {
        let row = document.createElement("div");
        Element.setClass(row, "row table-row")
        row.onclick = (e) => {
            handleClick(e);
        }
        let keys = Object.keys(data);
        keys.forEach((key, index) => {
            let td = document.createElement("div");
            Element.setClass(td, "table-item");
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
        row.style.backgroundColor = pallete.bg_light;
        row.style.borderBottom = `1px ${pallete.gray} solid`;
        row.style.transition = `0.3s all linear`
        row.onmouseover = () => {
            row.style.backgroundColor = pallete.green_light;
        }
        row.onmouseleave = () => {
            if (row.getAttribute("selected") == null){
                row.style.backgroundColor = pallete.bg_light;
            }
        }
        vertInd++;
    }

    let uploadJson = () => {
        let oReq = new XMLHttpRequest();
        oReq.onload = function(e) {
            let resp = e.currentTarget.response;
            resp.forEach(elem => {
                let address = elem['address'];
                let phone = elem['phone'];
                let fullName = elem['full_name'];
                storage.addNewRecord(fullName, phone, address);
                storage.refreshStorage();
                window.location.reload();
            });
        }
        oReq.open("GET", requestURL);
        oReq.responseType = "json";
        oReq.send();
    };

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
        for (let address in addresses){
            let phone = addresses[address];
            let full_name = phones[phone];
            createRow({
                full_name : full_name,
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

    let initBtns = () => {
        hostBtn.onclick = loadTestData;
        addBtn.onclick = (e) => {
            let modal = new Element("div");
            Element.setClass(modal,'modal');

            let form = new Element("form");
            let span = new Element("span");

            Element.setClass(span,"heading");
            span.innerText = ("Add new info");

            form.appendChild(span);

            let createInput = (id, placeholder) => {
                let input = new Element("input");
                Element.setId(input, id);
                Element.setPlaceholder(input,placeholder);
                input.setAttribute("autocomplete","off");
                form.appendChild(input);
                return input;
            }

            createInput("full_name", "Name");

            let input = createInput("phone", "Phone");
            input.setAttribute("type","phone");

            createInput("address", "Address")

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
        clearBtn.onclick = (e) => {
            clearSelected(e);
            checkDisabled(e);
        }
        deleteBtn.onclick = (e) => {
            selectedRow = [];
            let rowsToDelete = [];
            let r = [...rows]
            for (let i = 0; i < r.length; i++){
                let row = r[i];
                if (row.getAttribute("selected") !== null){
                    rowsToDelete.push(row);
                    storage.deleteData(row);
                    storage.refreshStorage();
                }
            }
            rowsToDelete.forEach((elem) => {
                table.removeChild(elem);
            });
            r = [...rows]
            if (r.length === 1) showEmptySlide();;
            checkDisabled(e);
        }
        fileBtn.onchange = (e) => {
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function(event) {
                let contents = event.target.result;
                let data = JSON.parse(contents);
                storage.clean();
                data.forEach((obj) => {
                    let name = obj["full_name"];
                    let phone = obj["phone"];
                    let address = obj["address"];
                    storage.addNewRecord(name,phone,address);
                });
                clearTable();
                buildTableFromStorage();
            };

            reader.onerror = function(event) {
                console.error("Файл не может быть прочитан! код " + event.target.error.code);
            };

            reader.readAsText(file);
        }
        downloadBtn.onclick = (e) => {
            downloadFile("lpu.json");
        }
    }

    checkDisabled();
    initBtns();
    buildTableFromStorage();
});