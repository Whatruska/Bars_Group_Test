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
    let selectedRow = [];
    let vertInd = 0;

    clearBtn.onclick = (e) => {
        selectedRow = [];
        let rows = table.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++){
            let row = rows.item(i);
            row.removeAttribute("style");
            row.removeAttribute("selected");
        }
    }

    deleteBtn.onclick = (e) => {
        selectedRow = [];
        let rowsToDelete = [];
        let rows = table.getElementsByTagName("tr");
        for (let i = 0; i < rows.length; i++){
            let row = rows.item(i);
            if (row.getAttribute("selected") !== null){
                console.log(i);
                rowsToDelete.push(row);
                storage.removeItem(getPhone(row));
                storage.removeItem(getAddress(row));
                storage.removeItem(getCompanyName(row));
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

    addBtn.onclick = (e) => {
        let modal = document.createElement("div");
        let style = modal.style;
        style.position = "absolute";
        style.backgroundColor = "red";
        style.top = "0"
        style.right = "0"
        style.zIndex = 15
        style.width = "100%"
        style.height = "100%"
        style.backgroundColor = "transparent"
        style.display = "flex"
        style.flexDirection = "column"
        style.justifyContent = "center"
        style.alignItems = "center"

        let form = document.createElement("form");
        let span = document.createElement("span");
        span.setAttribute("className", "heading");
        span.innerText = "Add new info"
        form.appendChild(span);
        form.style.backgroundColor = "white"
        form.style.display = "flex"
        form.style.flexDirection = "column"
        form.style.justifyContent = "center"
        form.style.alignContent = "center"
        let input = document.createElement("input");
        input.setAttribute("id","full_name");
        form.appendChild(input);
        input = document.createElement("input");
        input.setAttribute("id","phone");
        form.appendChild(input);
        input = document.createElement("input");
        input.setAttribute("id","address");
        form.appendChild(input);
        form.focus();
        form.onmouseleave = (e) => {
            hideModal(e, modal);
        }
        let button = document.createElement("button");
        button.innerText = "Add"
        form.appendChild(button);

        modal.appendChild(form);

        main.style.transition = "0.7s all linear";
        main.style.filter = "blur(10px)"

        header.style.transition = "0.7s all linear";
        header.style.filter = "blur(10px)"

        body.appendChild(modal);
    }

    let showEmptySlide = () => {
        let container = document.getElementById("container");
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
                storage.setItem(phone, newValue);
                break;
            }

            case "address" : {
                let name = getCompanyName(row);
                storage.setItem(name, newValue);
                break;
            }

            case "phone" : {
                let address = getAddress(row);
                storage.setItem(address, newValue);
                break;
            }
        }
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
            style.backgroundColor = "blue";
            target.setAttribute("selected","");
            selectedRow.push(vertIndex);
        } else {
            style.backgroundColor = "transparent";
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
        storage.clear();
        data.forEach(elem => {
            console.log(elem)
            let address = elem['address'];
            let phone = elem['phone'];
            let fullName = elem['full_name'];

            storage.setItem(phone, fullName);
            storage.setItem(fullName, address);
            storage.setItem(address, phone);

            createRow(elem)
        });
    });

    let buildTableFromStorage = () => {
        let keys = Object.keys(storage).sort((a, b) => b.length - a.length);
        for (let i = 0; i < storage.length / 3; i++){
            let address = keys[i];
            let phone = storage[address];
            let fullname = storage[phone];
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
