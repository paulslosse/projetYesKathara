// %% addrCleanStr
// %% addrCheckStr
// %% maskCheckDec
// %% subnetID
// %% maskDec2Tab
// %% addrTab2Bin
// %% addrBin2Str
// %% routeBuild
// %% genMAC
// %% getInterfaceType
// %% getRouteType
// %% getDeviceType
// %% pushDeviceObj
// %% loadcsvFile
// %% addSwitches
// %% buildSwitch
// %% createHTMLNodeTitle
// %% createHTMLEdgeTitle
// %% slicebin
// %% addrTab2Str
// %% findClass
// %% splitLabel
// %% splitLineRoute
// %% destroy
// %% clearPopUp
// %% cancelEdit
// %% networkCheck
// %% saveData
// %% buildNodeDevices
// %% buildEdges
// %% buildNetwork
// %% reDrawEdges
// %% drawNetwork
// $$ clusterByRouter
// $$ previewFile
// $$ nopreviewFile
// $$ nodes
// $$ edges

// device colors : blue yellow red green pink pink
const colorBg = ["#97C2FC", "#FFFF00", "#FB7E81", "#7BE141", "#EB7DF4", "#AD85E4"]; // background color
const colorBd = ["#2B7CE9", "#FFA500", "#FA0A10", "#41A906", "#E129F0", "#7C29F0"]; // border color
const colorHlBg = ["#D2E5FF", "#FFFFA3", "#FFAFB1", "#A1EC76", "#F0B3F5", "#D3BDF0"]; // hilight background color
const colorHlBd = ["#2B7CE9", "#FFA500", "#FA0A10", "#41A906", "#E129F0", "#7C29F0"]; // hilight border color

var nodes; // node network map structure
var edges; // edge network map structure
const nodeFilters = document.getElementsByName("nodesFilter"); // node filter
const edgeFilters = document.getElementsByName("edgesFilter"); // edge filter
var dataNet; // node & edge map structure
var networkMap; // map structure

var nodeID = -1; // number of nodes
var deviceObjList = []; // list of read devices in csv file
var networkList = []; // list of ethernet networks
var nodeList = []; // node list to build
var edgeList = []; // edge list to build

const maxRouter = 5; // max number of routers
var edgeRouterFlagTab = [true, true, true, true, true]; // router up flags

function alert(msg) {
    let textarea = document.getElementById("logs");
    msg = textarea.value + msg + "\n>";
    textarea.value = msg;
}

// suppress leading left 0 of IP address
function addrCleanStr(addrStr) {
    let addrTab = addrStr.split("."); // convert address to dec field tab
    let addrCleanTab = []; // reserve clean address dec field tab
    for (let addrField of addrTab) {
        // scan address fields
        while (addrField.startsWith("0")) {
            // if 0 left
            addrField = addrField.substring(1); // remove 0 left
        }
        if (addrField == "") {
            // test if nothing remain
            addrField = "0"; // add 0
        }
        addrCleanTab.push(addrField); // add field to address
    }
    addrStr = addrCleanTab.join("."); // format address to string
    return addrStr; // return string address
}

// check IP address validity value is decimal 2 bits
function addrCheckStr(addrStr) {
    let addrTab = addrStr.split("."); // convert address to dec field tab
    if (addrTab.length < 4) {
        // check length
        return false;
    }
    let addrBin = addrTab2Bin(addrTab); // convert decimal to binary
    let addrChkStr = addrBin2Str(addrBin); // convert binary 32 bits to decimal
    if (addrChkStr == addrStr) {
        // check if initial value is 32 bits
        return true;
    } else {
        return false;
    }
}

// check IP mask validity
function maskCheckDec(maskDec) {
    if (-1 < maskDec && maskDec < 33) {
        // check value
        return true;
    }
    return false;
}

// calculate subnet (to change)
function subnetID(addrTab, maskTab) {
    let addrMaskedTab = new Array(0, 0, 0, 0); // initialize address fields
    for (let iDigit = 0; iDigit < 4; iDigit++) {
        // scan address fields
        addrMaskedTab[iDigit] = addrTab[iDigit] & maskTab[iDigit]; // make and operation
    }
    return addrMaskedTab; // return dec address masked field tab
}

function calculateNetworkIP(ipAddress, maskIP) {
    let binaryIP = convertIPToBinaryIP(ipAddress);
    let maskBinaryIP = convertIPToBinaryIP(maskIP);

    let binaryNetwork = [];
    for (let jMask = 0; jMask < maskBinaryIP.length; jMask++) {
        binaryNetwork.push(bitwiseAND(binaryIP[jMask], maskBinaryIP[jMask]));
    }

    let NetworkIPArr = convertBinaryIPToDecIP(binaryNetwork);

    let NetworkIPStr = "";
    for (let kNetwork = 0; kNetwork < NetworkIPArr.length; kNetwork++) {
        NetworkIPStr += NetworkIPArr[kNetwork] + ".";
    }
    return NetworkIPStr.slice(0, -1);
}

function calculateBroadcastIP(ipAddress, maskIP) {
    let binaryIP = convertIPToBinaryIP(ipAddress);
    let maskBinaryIP = convertIPToBinaryIP(maskIP);
    let invertedMark = [];
    for (let iMask = 0; iMask < maskBinaryIP.length; iMask++) {
        invertedMark.push(invertedBinary(maskBinaryIP[iMask]));
    }

    let binaryBroadcast = [];
    for (let jMask = 0; jMask < maskBinaryIP.length; jMask++) {
        binaryBroadcast.push(bitwiseOR(binaryIP[jMask], invertedMark[jMask]));
    }

    let broadcastIPArr = convertBinaryIPToDecIP(binaryBroadcast);

    let broadcastIPStr = "";
    for (let kBroadcast = 0; kBroadcast < broadcastIPArr.length; kBroadcast++) {
        broadcastIPStr += broadcastIPArr[kBroadcast] + ".";
    }
    return broadcastIPStr.slice(0, -1);
}

function invertedBinary(number) {
    var noArrStr = number + "";
    var noArr = noArrStr.split("");
    var newNo = "";
    for (var i = 0; i < noArr.length; i++) {
        if (noArr[i] == "0") {
            newNo += "1";
        } else {
            newNo += "0";
        }
    }
    return newNo;
}

function bitwiseAND(firstBinary, secondBinary) {
    var firstArr = [];
    var secondArr = [];
    firstArr = firstBinary.split("");
    secondArr = secondBinary.split("");
    var newAdded = "";
    for (var iFirst = 0; iFirst < firstArr.length; iFirst++) {
        if (firstArr[iFirst] + "+" + secondArr[iFirst] == "1+0") {
            newAdded += "0";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "0+1") {
            newAdded += "0";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "1+1") {
            newAdded += "1";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "0+0") {
            newAdded += "0";
        }
    }
    return newAdded;
}

function bitwiseOR(firstBinary, secondBinary) {
    var firstArr = [];
    var secondArr = [];
    firstArr = firstBinary.split("");
    secondArr = secondBinary.split("");
    var newAdded = "";
    for (var iFirst = 0; iFirst < firstArr.length; iFirst++) {
        if (firstArr[iFirst] + "+" + secondArr[iFirst] == "1+0") {
            newAdded += "1";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "0+1") {
            newAdded += "1";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "1+1") {
            newAdded += "1";
        } else if (firstArr[iFirst] + "+" + secondArr[iFirst] == "0+0") {
            newAdded += "0";
        }
    }
    return newAdded;
}

function convertBinaryIPToDecIP(binaryIPArr) {
    var broadcastIP = [];
    for (var iBinary = 0; iBinary < binaryIPArr.length; iBinary++) {
        broadcastIP.push(parseInt(parseInt(binaryIPArr[iBinary]), 2));
    }
    return broadcastIP;
}

function convertIPToBinaryIP(ipAddress) {
    var ipArr = ipAddress.split(".");
    var binaryIP = [];
    for (var iIp = 0; iIp < ipArr.length; iIp++) {
        var binaryNo = parseInt(ipArr[iIp]).toString(2);
        if (binaryNo.length == 8) {
            binaryIP.push(binaryNo);
        } else {
            var diffNo = 8 - binaryNo.length;
            var createBinary = "";
            for (var jDiff = 0; jDiff < diffNo; jDiff++) {
                createBinary += "0";
            }
            createBinary += binaryNo;
            binaryIP.push(createBinary);
        }
    }
    return binaryIP;
}

// check for reserved address subnet or broadcast
function addrReservedStr(addrStr, maskDec) {
    let maskTab = maskDec2Tab(maskDec); // convert dec mask to dec field tab
    let maskStr = maskTab.join("."); // format mask to string
    let addrSubnetStr = calculateNetworkIP(addrStr, maskStr); // calculate network
    let addrBroadcastStr = calculateBroadcastIP(addrStr, maskStr); // calculate broadcast
    if (addrStr == addrSubnetStr || addrStr == addrBroadcastStr) {
        // test if reserved address
        return true;
    }
    return false;
}

// Convert mask dec to tab
function maskDec2Tab(maskDec) {
    let maskBin = "".padStart(32 - maskDec, "0").padStart(32, "1"); // convert dec mask to binary
    let maskTab = []; // reserve mask dec field tab
    for (let iDigit = 0; iDigit < 4; iDigit++) {
        // scan mask fields
        let gBin = maskBin.slice(iDigit * 8, iDigit * 8 + 8); // split block binary 8bit
        maskTab.push(parseInt(gBin, 2)); // bin to dec field tab
    }
    return maskTab; // return dec mask field tab
}

// convert address tab to binary
function addrTab2Bin(addrTab) {
    var addrBin = "";
    for (let iDigit = 0; iDigit < addrTab.length; iDigit++) {
        addrBin = addrBin + parseInt(addrTab[iDigit]).toString(2).padStart(8, "0");
    }
    return addrBin; // return binary address
}

// convert address tab to string representation
function addrTab2Str(addrTab) {
    var addrStr = "";
    for (let iDigit = 0; iDigit < addrTab.length; iDigit++) {
        addrStr = addrStr + parseInt(addrTab[iDigit]) + ".";
    }
    addrStr = addrStr.slice(0, addrStr.length - 1);
    return addrStr;
}

// convert address binary to str
function addrBin2Str(addrBin) {
    let addrStr = [];
    for (let iDigit = 0; iDigit < 4; iDigit++) {
        let gBin = addrBin.slice(iDigit * 8, iDigit * 8 + 8); // Split block binary 8bit
        addrStr = addrStr + parseInt(gBin, 2) + "."; // Bin to Number
    }
    addrStr = addrStr.slice(0, addrStr.length - 1);
    return addrStr; // return string address
}

// split route line
function splitLineRoute(routeLineStr) {
    return {
        addr: routeLineStr.split(",")[0],
        mask: routeLineStr.split(",")[1],
        gateway: routeLineStr.split(",")[2],
    };
}

// build route for device
function routeBuild(addrStr, maskDec, gatewayStr) {
    let routeStr = addrStr + "," + maskDec + "," + gatewayStr;
    return routeStr; // return string route
}

// generate mac address
function genMAC() {
    var hexDigits = "0123456789abcdef"; // initialyze hex digits
    var addrMac = "08:"; // set mac address unicast
    for (var iDigit = 1; iDigit < 6; iDigit++) {
        // scan 5 other digit
        addrMac += hexDigits.charAt(Math.round(Math.random() * 15)); // add a random value
        addrMac += hexDigits.charAt(Math.round(Math.random() * 15));
        if (iDigit != 5) addrMac += ":"; // add deparator
    }
    return addrMac; // return string mac address
}

// split binary with mask
function slicebin(maskBin, maskDec) {
    let binaryLeft = maskBin.slice(0, maskDec);
    let binaryDatLeft = "";

    for (let iBit = 0; iBit < binaryLeft.length; iBit += 8) {
        let jBit = Math.min(iBit + 8, binaryLeft.length);
        binaryDatLeft = binaryDatLeft + binaryLeft.slice(iBit, jBit) + ".";
    }

    binaryDatLeft = binaryDatLeft.slice(0, binaryDatLeft.length - 1);

    let binaryRight = maskBin.slice(maskDec, 32);
    let binaryDatRight = "";

    for (let iBit = binaryRight.length; iBit >= 0; iBit -= 8) {
        let jBit = Math.max(iBit - 8, 0);
        binaryDatRight = binaryRight.slice(jBit, iBit) + "." + binaryDatRight;
    }

    binaryDatRight = binaryDatRight.slice(0, binaryDatRight.length - 1);
    maskBin = binaryDatLeft + " | " + binaryDatRight;
    return maskBin;
}

// get class of IP address
function findClass(addrStr) {
    return [8, 16, 24][Math.log2((addrStr.slice(0, 3) ^ 255) | 8) ^ 7];
}

// split label
function splitLabel(labelStr) {
    return {
        addr: labelStr.split("/")[0],
        mask: labelStr.split("/")[1],
    };
}

// check address validity
function addrValidityStr(addrStr, maskDec) {
    if (!addrCheckStr(addrStr)) {
        // check address
        alert("Invalid address on the interface : " + addrStr);
    }

    if (!maskCheckDec(maskDec)) {
        // check mask
        alert("Invalid mask on the interface : " + maskDec);
    }

    if (addrCheckStr(addrStr) && maskCheckDec(maskDec)) {
        if (addrReservedStr(addrStr, maskDec)) {
            // check for reserved address
            alert("Reserved address on the interface : " + addrStr);
        }
    }
}

// identify device type
function getInterfaceType(addrStr, maskDec) {
    //        if (addrCheckStr(addrStr) && maskCheckDec(maskDec) && maskDec.trim() != '') {
    if (addrCheckStr(addrStr) && maskCheckDec(maskDec)) {
        let classDec = findClass(addrStr);
        if (classDec == maskDec) {
            addrType = "standard";
        }
        if (classDec < maskDec) {
            addrType = "subnet";
        }
        if (classDec > maskDec) {
            addrType = "classless";
        }
    } else {
        alert("Invalid address or mask on the interface " + addrStr + " & " + maskDec);
        addrType = "bad_interface";
    }
    return addrType; // return address type
}

// identify router type
function getRouteType(addrStr, maskDec, gatewayStr) {
    let routeType = "no_gateway";
    //        if (addrCheckStr(addrStr) && maskCheckDec(maskDec) && maskDec.trim() != '') {
    if (addrCheckStr(addrStr) && maskCheckDec(maskDec)) {
        let networkTab = addrStr.split(".");
        let maskTab = maskDec2Tab(maskDec);
        let networkMaskedTab = subnetID(networkTab, maskTab);
        let networkMaskedStr = addrTab2Str(networkMaskedTab);
        if (networkMaskedStr == addrStr) {
            if (gatewayStr != "") {
                if (addrCheckStr(gatewayStr)) {
                    routeType = "add_gateway";
                } else {
                    alert("Invalid gateway address! " + addrStr);
                    routeType = "bad_route";
                }
            }
        } else {
            alert("Invalid destination address in the routing table " + addrStr + " & " + maskDec);
            routeType = "bad_route";
        }
    } else {
        alert("Invalid address or mask in the routing table " + addrStr + " & " + maskDec);
        routeType = "bad_route";
    }
    return routeType; // return address type
}

//identify device type
function getDeviceType(
    deviceAddrStr,
    deviceMaskDec,
    routeNetworkStrList,
    routeMaskDecList,
    routeGatewayStrList
) {
    deviceType = getInterfaceType(deviceAddrStr, deviceMaskDec);

    for (let iRoute = 0; iRoute < routeNetworkStrList.length; iRoute++) {
        let routeNetworkStr = routeNetworkStrList[iRoute];
        let routeMaskDec = routeMaskDecList[iRoute];
        let routeGatewayStr = routeGatewayStrList[iRoute];
        routeType = getRouteType(routeNetworkStr, routeMaskDec, routeGatewayStr);
        if (routeType != "no_gateway") {
            deviceType = routeType;
        }

        if (routeType == "bad_route") {
            break;
        }
    }
    return deviceType; // return address type
}

// add device objects to list
function pushDeviceObj(
    id,
    deviceCat,
    deviceType,
    deviceAddrStr,
    deviceMaskDec,
    deviceNetwork,
    deviceRoute,
    deviceEthernet
) {
    let deviceObj = {}; // create new object
    deviceObj["id"] = id;
    if (deviceCat.startsWith("router")) {
        deviceType = "router";
    }
    deviceObj["cat"] = deviceCat;
    deviceObj["type"] = deviceType;
    deviceObj["addr"] = deviceAddrStr;
    deviceObj["mask"] = deviceMaskDec;
    deviceObj["network"] = deviceNetwork;
    deviceObj["route"] = deviceRoute;
    deviceObj["ethernet"] = deviceEthernet;
    deviceObjList.push(deviceObj);
}

// load csv file and put device information in list
function loadcsvFile(csvFile) {
    let id = 0;
    let stationCount = 0;
    let lineList = csvFile.split("\n");

    let deviceCat, deviceAddrStr, deviceMaskDec, deviceNetwork, deviceRoute, deviceEthernet;
    let routeNetworkStrList = [], routeMaskDecList = [], routeGatewayStrList = [];
    let firstRoute = true;

    for (let iLine = 1; iLine < lineList.length; iLine++) {
        let line = lineList[iLine].replace("\r", "");
        let entryList = line.split(";");

        let deviceEntry = entryList[0].trim();
        if (deviceEntry === "") continue;

        switch (deviceEntry) {
            case "station":
            case deviceEntry.startsWith("router") ? deviceEntry : "":
                if (stationCount > 0) {

                    // Push current device object if it exists
                    deviceType = getDeviceType(
                        deviceAddrStr,
                        deviceMaskDec,
                        routeNetworkStrList,
                        routeMaskDecList,
                        routeGatewayStrList
                    );
                    pushDeviceObj(
                        id++,
                        deviceCat,
                        deviceType,
                        deviceAddrStr,
                        deviceMaskDec,
                        deviceNetwork,
                        deviceRoute,
                        deviceEthernet
                    );
                }

                // Setup new device
                deviceCat = deviceEntry;
                deviceAddrStr = entryList[1].trim();
                deviceMaskDec = entryList[2].trim();
                deviceNetwork = networkCheck(entryList[4].trim());
                deviceRoute = "";
                deviceEthernet = entryList[5] ? entryList[5].trim() : genMAC();

                deviceAddrStr = addrCleanStr(deviceAddrStr);
                addrValidityStr(deviceAddrStr, deviceMaskDec);

                stationCount++;
                firstRoute = true;
                routeNetworkStrList = [];
                routeMaskDecList = [];
                routeGatewayStrList = [];
                break;

            case "routing table":
                if (stationCount === 0) break;

                if (!firstRoute) {
                    deviceRoute += ";";
                }
                firstRoute = false;

                let routeNetworkStr = entryList[1].trim();
                let routeMaskDec = entryList[2].trim();
                let routeGatewayStr = entryList[3].trim();

                routeNetworkStrList.push(routeNetworkStr);
                routeMaskDecList.push(routeMaskDec);
                routeGatewayStrList.push(routeGatewayStr);

                deviceRoute += `${routeNetworkStr},${routeMaskDec},${routeGatewayStr}`;
                break;
        }
    }

    if (stationCount > 0) {
        // Push last device description if it exists
        deviceType = getDeviceType(
            deviceAddrStr,
            deviceMaskDec,
            routeNetworkStrList,
            routeMaskDecList,
            routeGatewayStrList
        );
        pushDeviceObj(
            id,
            deviceCat,
            deviceType,
            deviceAddrStr,
            deviceMaskDec,
            deviceNetwork,
            deviceRoute,
            deviceEthernet
        );
    }
}

function generateForDownload() {
    let csvContent = "Type;Address;Mask;Gateway;Network;Ethernet\n"; // En-tête du fichier CSV

    deviceObjList.forEach(device => {
        let deviceLine = `${device.cat};${device.addr};${device.mask};;${device.network};${device.ethernet}\n`;
        csvContent += deviceLine;
        let routeArray = device.route.split(";");
        routeArray.forEach(route => {
            if (route === "") return;
            let routeFields = route.split(",");
            let routeLine = `routing table;${routeFields[0]};${routeFields[1]};${routeFields[2]};\n`;
            csvContent += routeLine;
        });
    });

    downloadCSV(csvContent);
}

function downloadCSV(csvContent) {
    const blob = new Blob([csvContent], { type: "text/txt" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "network_config.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// add switches
function addSwitches() {
    networkList.forEach((network) => {
        nodeObjSwitch = buildSwitch(network);
    });
}

// build node switch object
function buildSwitch(network) {
    let nodeObjSwitch = {};
    let nodeEthernetID = parseInt(100 + network);
    nodeObjSwitch["id"] = nodeEthernetID;
    nodeObjSwitch["label"] = "Switch";
    nodeObjSwitch["group"] = network;
    nodeObjSwitch["mass"] = 4;
    nodeObjSwitch["cat"] = "switchEth";
    nodeObjSwitch["type"] = "switchEth";
    nodeObjSwitch["shape"] = "circle";
    nodeList.push(nodeObjSwitch);
    return nodeObjSwitch;
}

// create node popup
function createHTMLNodeTitle(content) {
    var element = document.createElement("div");
    var html = "";
    html = html + "<table>";
    html = html + "<tr>";
    html = html + "<th>Destination</th>";
    html = html + "<th>Mask</th>";
    html = html + "<th>Gateway</th>";
    html = html + "</tr>";

    var linesTab = content.split(";");
    for (let iLine = 0; iLine < linesTab.length; iLine++) {
        html = html + "<tr>";
        var fieldsTab = linesTab[iLine].split(",");
        for (let iField = 0; iField < fieldsTab.length; iField++) {
            html = html + "<td>" + fieldsTab[iField] + "</td>";
        }
        html = html + "</tr>";
    }

    html = html + "</table>";
    element.innerHTML = html;
    return element;
}

// create link popup
function createHTMLEdgeTitle(
    dstAddrStr,
    dstAddrBinSliced,
    routingTable,
    srcRouteAddrStr,
    srcRouteMaskBinSliced,
    dstSubnetIDsrcRouteMaskBin
) {
    var element = document.createElement("div");
    var html = "";
    html = html + "Target " + dstAddrStr + "</br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#11183;";
    html = html + "<table>";
    html = html + "<tr>";
    html = html + "<th>Destination</th>";
    html = html + "<th>Mask</th>";
    html = html + "<th>Gateway</th>";
    html = html + "</tr>";

    var linesTab = routingTable.split(";");
    for (let iLine = 0; iLine < linesTab.length; iLine++) {
        html = html + "<tr>";
        var fieldsTab = linesTab[iLine].split(",");
        for (let iField = 0; iField < fieldsTab.length; iField++) {
            html = html + "<td>" + fieldsTab[iField] + "</td>";
        }
        html = html + "</tr>";
    }

    html = html + "</table>";
    html = html + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#11183;</br>";
    html = html + "Match destination " + srcRouteAddrStr + "</br></br>";
    html = html + "&nbsp;&nbsp;Target " + dstAddrBinSliced + "</br>";
    html = html + "& &nbsp;Mask " + srcRouteMaskBinSliced + "</br>";
    html = html + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10149; " + dstSubnetIDsrcRouteMaskBin;
    element.innerHTML = html;
    return element;
}

// destroy map
function destroy() {
    if (networkMap !== null) {
        networkMap.destroy();
        networkMap = null;
    }
}

// close edit table
function clearPopUp() {
    document.getElementById("saveButton").onclick = null;
    document.getElementById("cancelButton").onclick = null;
    document.getElementById("network-popUp").style.display = "none";
}

// cancel edit
function cancelEdit(callback) {
    clearPopUp();
    callback(null);
}

function networkCheck(networkValue) {
    networkValue = Math.min(networkValue, colorBg.length);
    networkValue = Math.max(networkValue, 1);
    return networkValue.toString();
}

// save popup information in map and internal structure after add or modify
function saveData(data, callback) {
    data.id = document.getElementById("node-id").value; // set id

    let networkValue = document.getElementById("node-network-number").value; // get nerwork number
    let groupStr = networkCheck(networkValue); // check and convert network to group

    if (data.id == -1) {
        // add device        
        nodeID = nodeID + 1; // increment number of nodes
        let nodeObj = {}; // create a new node
        nodeList.splice(nodeID, 0, nodeObj); // insert new node in node list after stations and before routers
        data.id = nodeID; // set id
    } else {
        // modify device
        let colorIndex = networkValue - 1; // get network color index
        data.color.background = colorBg[colorIndex]; // set background color
        data.color.border = colorBd[colorIndex]; // set border color
        data.color.highlight.background = colorHlBg[colorIndex]; // set hilight background color
        data.color.highlight.border = colorHlBd[colorIndex]; // set hilight border color
    }

    let deviceAddrStr = document.getElementById("node-address").value.trim(); // get device adddress
    let deviceMaskDec = document.getElementById("node-mask").value.trim(); // get device mask

    deviceAddrStr = addrCleanStr(deviceAddrStr); // clean device adddress
    addrValidityStr(deviceAddrStr, deviceMaskDec); // check device adddress

    data.label = deviceAddrStr + "/" + deviceMaskDec; // set label
    data.address = deviceAddrStr + "/" + deviceMaskDec; // set address
    data.group = groupStr; // set group
    data.cat = document.getElementById("node-cat").value; // set category

    let ethernetTable = document.getElementById("node-ethernet"); // get table with mac address
    data.ethernet = ethernetTable.rows[0].cells[1].textContent; // set mac address

    let deviceEthernet = data.ethernet; // prepare object set
    let deviceCat = data.cat; // prepare object set
    let deviceNetwork = data.group; // prepare object set

    var routingTable = ""; // initialize routing table
    var firstRoute = true; // initialize routing table
    var deviceRoute = ""; // initialize routing table
    var routeNetworkStrList = []; // initialize routing table
    var routeMaskDecList = []; // initialize routing table
    var routeGatewayStrList = []; // initialize routing table

    for (iLine = 1; iLine < 5; iLine++) {
        // scan lines of routing table
        let routeNetworkStr = document
            .getElementById("node-routing-destination-" + iLine.toString())
            .value.trim(); // get destination network
        let routeMaskDec = document.getElementById("node-routing-mask-" + iLine.toString()).value.trim(); // get destination mask
        let routeGatewayStr = document
            .getElementById("node-routing-gateway-" + iLine.toString())
            .value.trim(); // get gateway address

        if (routeNetworkStr.trim() == "") {
            // stop scanning if route is empty
            break;
        }

        if (!firstRoute) {
            deviceRoute = deviceRoute + ";"; // add separator
        }
        firstRoute = false;

        routeNetworkStrList.push(routeNetworkStr); // prepare object set
        routeMaskDecList.push(routeMaskDec); // prepare object set
        routeGatewayStrList.push(routeGatewayStr); // prepare object set
        deviceRoute = deviceRoute + routeNetworkStr + "," + routeMaskDec + "," + routeGatewayStr; // prepare object set
    }

    data.route = deviceRoute; // set route list
    data.title = createHTMLNodeTitle(deviceRoute); // build node title popup

    deviceType = getDeviceType(
        deviceAddrStr,
        deviceMaskDec,
        routeNetworkStrList,
        routeMaskDecList,
        routeGatewayStrList
    ); // get device type
    if (data.cat.startsWith("router")) {
        // test if router device
        deviceType = "router"; // set router
        let iRouter = data.cat.substr(data.cat.length - 1); // get router number
        edgeRouterFlagTab[iRouter] = true; // set actif
    }
    data.type = deviceType; // set device type

    if (deviceType == "bad_interface" || deviceType == "bad_route") {
        // test if bad configuration
        data["color"] = "black"; // set color for bad configuration
        data["shape"] = "hexagon"; // set shape for bad configuration
    } else {
        // if good configuration
        if (data.cat.startsWith("router")) {
            // test if router
            data["shape"] = "dot"; // set shape for router
            data["size"] = 10; // set shape size for router
        } else {
            // if station
            data["shape"] = "box"; // set shape for station
        }
    }

    let existingDeviceIndex = deviceObjList.findIndex((device) => device.id == data.id);
    if (existingDeviceIndex != -1) {        
        deviceObjList[existingDeviceIndex] = {
            id: data.id,
            cat: deviceCat,
            type: deviceType,
            addr: deviceAddrStr,
            mask: deviceMaskDec,
            network: deviceNetwork,
            route: deviceRoute,
            ethernet: deviceEthernet,
        };
    } else {
        pushDeviceObj(
            data.id,
            deviceCat,
            deviceType,
            deviceAddrStr,
            deviceMaskDec,
            deviceNetwork,
            deviceRoute,
            deviceEthernet
        ); // add device
    }

    clearPopUp(); // close configuration popup
    callback(data); // set map

    // update device list to analyze communications
    nodeList[data.id].id = data.id;
    nodeList[data.id].label = data.label;
    nodeList[data.id].address = data.address;
    nodeList[data.id].group = data.group;
    nodeList[data.id].type = data.type;
    nodeList[data.id].cat = data.cat;
    nodeList[data.id].route = data.route;
    nodeList[data.id].ethernet = data.ethernet;
    nodeList[data.id].title = data.title;

    if (networkList.indexOf(data.group) == -1) {
        // create new network
        networkList.push(data.group); // add new network to network list
        nodeObjSwitch = buildSwitch(data.group); // build new switch
        nodes.add(nodeObjSwitch); // add new switch to map
    }

    reDrawEdges(); // redraw all communication edges
}

// build node device objects
function buildNodeDevices() {
    deviceObjList.forEach((deviceObj) => {
        let deviceCat = deviceObj.cat;
        let deviceType = deviceObj.type;
        let deviceAddrStr = deviceObj.addr;
        let deviceClassDec = findClass(deviceAddrStr);
        let deviceMaskDec = deviceObj.mask;
        let deviceNetwork = deviceObj.network;
        let deviceRoute = deviceObj.route;
        let deviceEthernet = deviceObj.ethernet;

        if (networkList.indexOf(deviceNetwork) == -1) {
            networkList.push(deviceNetwork);
        }

        nodeID = nodeID + 1;
        let nodeObj = {};
        nodeObj["id"] = nodeID;
        nodeObj["label"] = deviceAddrStr + "/" + deviceMaskDec;
        nodeObj["address"] = deviceAddrStr + "/" + deviceMaskDec;
        nodeObj["group"] = deviceNetwork;
        nodeObj["type"] = deviceType;
        nodeObj["cat"] = deviceCat;
        nodeObj["route"] = deviceRoute;
        nodeObj["ethernet"] = deviceEthernet;
        let titleStr = createHTMLNodeTitle(deviceRoute);
        nodeObj["title"] = titleStr;
        nodeObj["mass"] = 4;
        if (nodeObj.cat.startsWith("router")) {
            nodeObj["shape"] = "dot";
            nodeObj["size"] = 10;
        } else {
            nodeObj["shape"] = "box";
        }
        if (deviceType == "bad_interface" || deviceType == "bad_route") {
            nodeObj["color"] = "black";
            nodeObj["shape"] = "hexagon";
        }
        nodeList.push(nodeObj);
    });
}

// build edge objects
function buildEdges() {
    edgeList = [];
    // Check source to destination
    nodeList.forEach((scrNode) => {
        // analyze communication between each node
        nodeList.forEach((dstNode) => {
            if (scrNode.id != dstNode.id && scrNode.cat != "switchEth" && dstNode.cat != "switchEth") {
                // avoid analyze communication with the same node
                var edgeObj = {}; // new edge

                var srcPart = scrNode.address.split("/"); // extract source address and mask
                var srcAddrStr = srcPart[0]; // extract source address string part
                var srcAddrTab = srcAddrStr.split("."); // convert source address into dec tab

                var srcMaskDec = srcPart[1]; // extract source mask dec part
                var srcMaskTab = maskDec2Tab(srcMaskDec); // convert source mask into dec tab

                var srcSubnetIDsrcMaskedTab = subnetID(srcAddrTab, srcMaskTab); // apply source mask to source address
                var srcSubnetIDsrcMaskedStr = addrTab2Str(srcSubnetIDsrcMaskedTab); // convert source masked address dec tab into string

                var dstPart = dstNode.address.split("/"); // extract destination address and mask
                var dstAddrStr = dstPart[0]; // extract destination address string part
                var dstAddrTab = dstAddrStr.split("."); // convert destination address into dec tab

                var dstMaskDec = dstPart[1]; // extract destination mask dec part
                var dstMaskTab = maskDec2Tab(dstMaskDec); // convert destination mask into dec tab

                edgeObj["from"] = scrNode.id; // define edge origin
                edgeObj["to"] = dstNode.id; // define edge target
                edgeObj["shadow"] = true;
                edgeObj["length"] = 300;

                matchRouteFlag = false;

                var linesTab = scrNode.route.split(";"); // extract routing table lines
                for (let iLine = 0; iLine < linesTab.length; iLine++) {
                    // check each routing table entry
                    var fieldsTab = linesTab[iLine].split(","); // extract routing table components

                    var srcRouteAddrStr = fieldsTab[0]; // extract routing table subnet address string part

                    var srcRouteMaskDec = fieldsTab[1]; // extract routing table subnet mask string part
                    var srcRouteMaskTab = maskDec2Tab(srcRouteMaskDec); // convert routing table subnet mask into dec tab

                    var srcRouteGatewayStr = fieldsTab[2]; // extract routing table gateway address string part

                    var dstSubnetIDsrcRouteMaskedTab = subnetID(dstAddrTab, srcRouteMaskTab); // apply routing table subnet mask to destination address
                    var dstSubnetIDsrcRouteMaskedStr = addrTab2Str(dstSubnetIDsrcRouteMaskedTab); // convert destination masked address dec tab into string

                    // compare routing table subnet address with destination masked address

                    if (srcRouteAddrStr == dstSubnetIDsrcRouteMaskedStr) {
                        // matching subnets
                        matchRouteFlag = true;

                        var srcRouteMaskBin = addrTab2Bin(srcRouteMaskTab);
                        var srcRouteMaskBinSliced = slicebin(srcRouteMaskBin, srcRouteMaskDec);

                        var dstAddrBin = addrTab2Bin(dstAddrTab);
                        var dstAddrBinSliced = slicebin(dstAddrBin, srcRouteMaskDec);

                        var dstSubnetIDsrcRouteMaskBin = addrTab2Bin(dstSubnetIDsrcRouteMaskedTab);
                        var dstSubnetIDsrcRouteMaskBinSliced = slicebin(
                            dstSubnetIDsrcRouteMaskBin,
                            srcRouteMaskDec
                        );

                        edgeObj["title"] = createHTMLEdgeTitle(
                            dstAddrStr,
                            dstAddrBinSliced,
                            scrNode.route,
                            srcRouteAddrStr,
                            srcRouteMaskBinSliced,
                            dstSubnetIDsrcRouteMaskBinSliced
                        ); // create edge title
                        // display target (destination string address)
                        // display destination binary address
                        // display routing table
                        // display routing table subnet address
                        // display routing table mask
                        // display destination masked address

                        if (scrNode.group == dstNode.group) {
                            edgeObj["relation"] = "inside";
                            edgeObj["label"] = "inside";
                        } else {
                            edgeObj["dashes"] = true;
                            edgeObj["relation"] = "outside";
                            edgeObj["label"] = "outside";
                        }

                        if (srcRouteGatewayStr == "") {
                            edgeObj["label"] = "IP direct\n" + edgeObj["label"];
                        } else {
                            edgeObj["label"] =
                                "IP gateway\n" + edgeObj["label"] + "\nvia " + srcRouteGatewayStr;
                            edgeObj["relation"] = "routed";
                            edgeObj["width"] = 2;
                            edgeObj["dashes"] = [2, 10, 2, 10, 10, 10];
                        }

                        if (matchRouteFlag) {
                            edgeObj["label"] =
                                edgeObj["label"] +
                                "\n" +
                                srcRouteAddrStr +
                                " | /" +
                                srcRouteMaskDec +
                                " | " +
                                srcRouteGatewayStr;
                            break;
                        }
                    }
                }

                consistantFlag = false;
                for (let iLine = 0; iLine < linesTab.length; iLine++) {
                    // check each routing table entry
                    var fieldsTab = linesTab[iLine].split(","); // extract routing table components

                    var srcRouteAddrStr = fieldsTab[0]; // extract routing table subnet address string part

                    var srcRouteMaskDec = fieldsTab[1]; // extract routing table subnet mask string part
                    var srcRouteMaskTab = maskDec2Tab(srcRouteMaskDec); // convert routing table subnet mask into dec tab

                    var srcSubnetIDsrcRouteMaskedTab = subnetID(srcAddrTab, srcRouteMaskTab); // apply routing table subnet mask to destination address
                    var srcSubnetIDsrcRouteMaskedStr = addrTab2Str(srcSubnetIDsrcRouteMaskedTab); // convert destination masked address dec tab into string

                    if (srcRouteAddrStr == srcSubnetIDsrcRouteMaskedStr) {
                        // matching subnets
                        consistantFlag = true;
                    }
                }

                if (matchRouteFlag && !consistantFlag) {
                    edgeObj["relation"] = "bad_routing";
                    edgeObj["label"] = "IP\ninconsistent\nsubnetting";
                    edgeObj["color"] = "#000000"; // black
                    edgeObj["width"] = 2;
                }

                edgeObj["arrows"] = "to";
                edgeList.push(edgeObj);
            }

            // draw link station with switch
            if (scrNode.cat != "switchEth" && dstNode.cat == "switchEth") {
                // avoid analyze communication with the same node
                if (scrNode.group == dstNode.group) {
                    let edgeObjEthernet = {};
                    edgeObjEthernet["from"] = scrNode.id; // define edge origin
                    edgeObjEthernet["to"] = dstNode.id; // define edge target
                    edgeObjEthernet["shadow"] = true;
                    edgeObjEthernet["relation"] = "ethernet";
                    edgeObjEthernet["label"] = "Ethernet";
                    edgeObjEthernet["label"] = scrNode.ethernet;
                    edgeObjEthernet["width"] = 4;
                    edgeList.push(edgeObjEthernet);
                }
            }

            if (scrNode.id < dstNode.id) {
                if (scrNode.cat.startsWith("router") && scrNode.cat == dstNode.cat) {
                    // avoid analyze communication with the same node
                    let iRouter = scrNode.cat.substr(scrNode.cat.length - 1);
                    if (edgeRouterFlagTab[iRouter]) {
                        let edgeObj = {};
                        edgeObj["from"] = scrNode.id; // define edge origin
                        edgeObj["to"] = dstNode.id; // define edge target
                        edgeObj["shadow"] = true;
                        edgeObj["label"] = "Router " + iRouter.toString();
                        edgeObj["length"] = 10;
                        edgeObj["width"] = 4;
                        edgeObj["relation"] = "router";
                        edgeObj["color"] = "#000000"; // black
                        edgeList.push(edgeObj);
                    }
                }
            }
        });
    });
}

// build map
function buildNetwork() {
    const nodesFilterValues = {
        router: true,
        standard: true,
        subnet: false,
        classless: false,
        add_gateway: true,
        bad_interface: true,
        bad_route: true,
        switchEth: false,
    };

    const edgesFilterValues = {
        inside: true,
        bad_routing: true,
        outside: false,
        routed: false,
        ethernet: true,
        router: true,
    };

    const nodesFilter = (node) => {
        return nodesFilterValues[node.type];
    };

    const edgesFilter = (edge) => {
        return edgesFilterValues[edge.relation];
    };

    nodes = new vis.DataSet(nodeList);
    edges = new vis.DataSet(edgeList);
    const nodesView = new vis.DataView(nodes, { filter: nodesFilter });
    const edgesView = new vis.DataView(edges, { filter: edgesFilter });

    nodeFilters.forEach((filter) =>
        filter.addEventListener("change", (e) => {
            const { value, checked } = e.target;
            nodesFilterValues[value] = checked;
            nodesView.refresh();
        })
    );

    edgeFilters.forEach((filter) =>
        filter.addEventListener("change", (e) => {
            const { value, checked } = e.target;
            edgesFilterValues[value] = checked;
            edgesView.refresh();
        })
    );

    dataNet = { nodes: nodesView, edges: edgesView };
}

function reDrawEdges() {
    for (let edgeSelected of edgeList) {
        // remove all edges
        edges.remove(edgeSelected);
    }

    buildEdges(); // calculate communications

    for (let edgeSelected of edgeList) {
        // draw edges
        edges.add(edgeSelected);
    }
}

// draw map
function drawNetwork(data) {
    const container = document.getElementById("mynetwork");
    const options = {
        interaction: { keyboard: true },
        manipulation: {
            addNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById("operation").innerText = "Add Node";
                document.getElementById("node-id").value = -1;
                document.getElementById("node-cat").value = "";
                document.getElementById("node-type").value = "";
                document.getElementById("node-network-number").value = "0";
                let ethernetTable = document.getElementById("node-ethernet");
                ethernetTable.rows[0].cells[1].textContent = genMAC();
                document.getElementById("node-address").value = "";
                document.getElementById("node-mask").value = "";

                for (iLine = 1; iLine < 5; iLine++) {
                    document.getElementById("node-routing-destination-" + iLine.toString()).value = ""; // routeLineSplited.addr;
                    document.getElementById("node-routing-mask-" + iLine.toString()).value = ""; // routeLineSplited.mask;
                    document.getElementById("node-routing-gateway-" + iLine.toString()).value = ""; // routeLineSplited.gateway;
                }

                document.getElementById("saveButton").onclick = saveData.bind(this, data, callback);
                document.getElementById("cancelButton").onclick = clearPopUp.bind();
                document.getElementById("network-popUp").style.display = "block";
            },

            editNode: function (data, callback) {
                if (data.cat == "switchEth") {
                    alert("Switch can not be edited");
                    callback(null);
                    return;
                }

                // filling in the popup DOM elements
                document.getElementById("operation").innerText = "Edit Node";
                document.getElementById("node-id").value = data.id;
                document.getElementById("node-cat").value = data.cat;
                document.getElementById("node-type").value = data.type;
                document.getElementById("node-network-number").value = data.group;
                let ethernetTable = document.getElementById("node-ethernet");
                ethernetTable.rows[0].cells[1].textContent = data.ethernet;

                const labelSplited = splitLabel(data.address);
                document.getElementById("node-address").value = labelSplited.addr;
                document.getElementById("node-mask").value = labelSplited.mask;

                var routeSplited = data.route.split(";");
                for (iLine = 1; iLine < 5; iLine++) {
                    let routeLineStr = routeSplited[iLine - 1];
                    if (routeLineStr === undefined || routeLineStr == "") {
                        document.getElementById("node-routing-destination-" + iLine.toString()).value = ""; // routeLineSplited.addr;
                        document.getElementById("node-routing-mask-" + iLine.toString()).value = ""; // routeLineSplited.mask;
                        document.getElementById("node-routing-gateway-" + iLine.toString()).value = ""; // routeLineSplited.gateway;
                    } else {
                        const routeLineSplited = splitLineRoute(routeSplited[iLine - 1]);
                        document.getElementById("node-routing-destination-" + iLine.toString()).value =
                            routeLineSplited.addr;
                        document.getElementById("node-routing-mask-" + iLine.toString()).value =
                            routeLineSplited.mask;
                        document.getElementById("node-routing-gateway-" + iLine.toString()).value =
                            routeLineSplited.gateway;
                    }
                }

                document.getElementById("saveButton").onclick = saveData.bind(this, data, callback);

                document.getElementById("cancelButton").onclick = cancelEdit.bind(this, callback);

                document.getElementById("network-popUp").style.display = "block";
                networkMap.unselectAll();
            },

            deleteNode: function (data, callback) {
                
                let nodeDeleteID = data.nodes[0];
                let nodeDeleteIndex = nodeList.findIndex((node) => node.id == nodeDeleteID);
                console.log("Delete Node:", nodeDeleteID, nodeDeleteIndex);
                
                if (nodeList[nodeDeleteIndex].cat == "switchEth") {
                    alert("Switch can not be deleted");
                    callback(null);
                    networkMap.unselectAll();
                    return;
                }
                nodeList.splice(nodeDeleteIndex, 1);
                let deviceDeleteIndex = deviceObjList.findIndex((device) => device.id == nodeDeleteID);
                deviceObjList.splice(deviceDeleteIndex, 1);
                let edgeDeleteIndex = edgeList.findIndex((edge) => edge.from == nodeDeleteID || edge.to == nodeDeleteID);
                edgeList.splice(edgeDeleteIndex, 1);
                edges.remove(data.edges);
                nodes.remove(data.nodes);
                reDrawEdges();

                // for (let iIndex = 0; iIndex < nodeList.length; iIndex++) {
                //     if (nodeList[iIndex].id == nodeDeleteID) {
                //         if (nodeList[iIndex].cat == "switchEth") {
                //             alert("Switch can not be deleted");
                //             callback(null);
                //         }
                //     }
                // }
                callback(data);
                networkMap.unselectAll();
                return;
            },
        },

        physics: {
            enabled: true,
            solver: "repulsion",
            repulsion: {
                nodeDistance: 150,
            },
        },
    };
    networkMap = new vis.Network(container, data, options);
}

function clusterByRouter() {
    networkMap.setData(dataNet);
    var clusterOptionsByData;
    for (let nRouter = 1; nRouter <= maxRouter; nRouter++) {
        let catDevice = "router " + nRouter.toString();
        clusterOptionsByData = {
            joinCondition: function (childOptions) {
                return childOptions.cat == catDevice;
            },
            processProperties: function (clusterOptions, childNodes, childEdges) {
                var totalMass = 0;
                var firstRoute = true; // initialize routing table
                var deviceRoute = "";
                for (let iNode = 0; iNode < childNodes.length; iNode++) {
                    totalMass += childNodes[iNode].mass;
                    let iRouter = childNodes[iNode].cat.substr(childNodes[iNode].cat.length - 1);
                    edgeRouterFlagTab[iRouter] = false;
                    if (!firstRoute) {
                        deviceRoute = deviceRoute + ";"; // add separator
                    }
                    firstRoute = false;
                    deviceRoute = deviceRoute + childNodes[iNode].route;
                }
                clusterOptions.mass = totalMass;
                clusterOptions.title = createHTMLNodeTitle(deviceRoute);
                return clusterOptions;
            },
            clusterNodeProperties: {
                id: "cluster:" + catDevice,
                borderWidth: 3,
                shape: "database",
                group: catDevice,
                label: catDevice,
            },
        };
        edgeRouterFlag = false;
        networkMap.cluster(clusterOptionsByData);
    }
    reDrawEdges();
}

// load csv file and draw map
function previewFile() {
    const content = document.querySelector(".content");
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            // this will then display a text file
            loadcsvFile(reader.result);

            buildNodeDevices();
            addSwitches();
            buildEdges();
            buildNetwork();
            drawNetwork(dataNet);

            networkMap.on("selectNode", function (params) {
                if (params.nodes.length == 1) {
                    if (networkMap.isCluster(params.nodes[0]) == true) {
                        networkMap.openCluster(params.nodes[0]);
                        let iRouter = params.nodes[0].substr(params.nodes[0].length - 1);
                        edgeRouterFlagTab[iRouter] = true;
                        reDrawEdges();
                    }
                }
            });

            document.getElementById("select").style.display = "none";
            document.getElementById("logs").style.display = "block";
        },
        false
    );

    if (file) {
        reader.readAsText(file);
    }
}

function nopreviewFile() {
    document.getElementById("select").style.display = "none";
    document.getElementById("logs").style.display = "block";
    buildNodeDevices();
    addSwitches();
    buildEdges();
    buildNetwork();
    drawNetwork(dataNet);

    networkMap.on("selectNode", function (params) {
        if (params.nodes.length == 1) {
            if (networkMap.isCluster(params.nodes[0]) == true) {
                networkMap.openCluster(params.nodes[0]);
                let iRouter = params.nodes[0].substr(params.nodes[0].length - 1);
                edgeRouterFlagTab[iRouter] = true;
                reDrawEdges();
            }
        }
    });
}
