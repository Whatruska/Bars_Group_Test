document.addEventListener("DOMContentLoaded", function() {

    let requestURL = 'https://whatruska.github.io/Bars_Group_Test/app/lpu.json';
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    let storage = window.localStorage;
    let table = document.getElementById("table");

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
        return getColumnInRow(row, 1).innerText;
    }

    let getPhone = (row) => {
        return getColumnInRow(row, 2).innerText;
    }

    /*

        phone -> name
        name -> address
        address -> phone

    */

    let updateStore = (newValue, type, row) => {
        switch (type) {
            case "company" : {
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

    let vertInd = 0;

    let createRow = (data) => {
        let row = document.createElement("tr");
        let keys = Object.keys(data);
        keys.forEach((key, index) => {
            let td = document.createElement("td");
            td.innerText = data[key];
            td.setAttribute("horIndex", index);
            td.setAttribute("vertIndex", vertInd);
            td.setAttribute("key", key);
            td.ondblclick = handleDoubleClick;
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
            let fullName = elem['company'];

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
                company : fullname,
                address : address,
                phone : phone
            });
        }
    }

    buildTableFromStorage();
});
