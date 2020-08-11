/*
    API V1
    Author: Vaughn Nugent
    Date: 8/7/2020  
    Company: 1023 Diesel & Fleet INC
    Copyright (c) 2020-2028 1023 Diesel & Fleet INC  
    Description: V1 73Diesel.com Javascript API
*/

// Sort options for calibrations
const CalSort ={
    POWER:1,
    DATE:2,
    NAME:3,
    OPTIONS:4
};


class STD_API
{
    post_uri;
    status_buffer;
    User; 

    constructor ()
    {     
        this.User = new STD_User();
    }
    //Called to set the internal post URI 
    SetURI(post_uri)
    {
        this.post_uri = post_uri;
    }
    //Retruns true if login request was sent successfully
    //Submits status code and sets status buffer when callback is invoked
    Login(email, password, callback)
    {
        let form_fields= new FormData();  
        form_fields.set('LOGIN', 'LOGIN');  
        form_fields.set('email', email);
        form_fields.set('password', password);  
        this.ServerRequest(form_fields, callback);
    }
    //Always returns true
    //Status code is submitted when callback is invoked
    Logout(callback)
    {
        let form_fields= new FormData();
        form_fields.set('LOGIN', 'LOGOUT');    
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST',this.post_uri, true);  
        XMLHttpRequest.timeout = 2000;
        xhr.onreadystatechange = function() { 
            if (xhr.readyState == 4) {   
                window.localStorage.clear();    
                callback(xhr.status);
            }        
        };  
        xhr.send(form_fields);
        return true;
    }
    //Keepalive function
    Keepalive(){
        let form_fields= new FormData();
        form_fields.set('LOGIN', 'KEEPALIVE');
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST',this.post_uri, true);  
        XMLHttpRequest.timeout = 2000;
        xhr.onreadystatechange = function() { 
            if (xhr.readyState == 4) {    
                switch(xhr.status){              
                    case 408:                
                        //Server requested a timeout   
                        window.localStorage.clear();
                        location.reload();                     
                    break;
                    case 401:                   
                        window.localStorage.clear();
                        location.reload(); 
                    break;
                    case 200:   
                        //Everything is cool
                    break;  
                    default:             
                        window.localStorage.clear();
                        location.reload(); 
                    break;
                }
            }
        };  
        xhr.send(form_fields);
        return;    
    }
    //Request all user information from the server and store it to the user
    LoadUserStatus(callback)
    {
        let form_fields= new FormData();       
        form_fields.set('DEVICE', 'GET');    
        this.ServerRequest(form_fields, callback);
    }
    //Request an user token update
    UpdateUserTokens(callback){
        let form_fields= new FormData();
        form_fields.set('DEVICE', 'UPDATE_TOKENS');
        this.ServerRequest(form_fields, callback);
    }
    //Get all available calibrations for a device
    GetCalibrations(serial_number, callback)
    {
        let form_fields= new FormData();
        form_fields.set('DEVICE', 'POLULATE_CALS');
        form_fields.set('selected_serial_number', serial_number);  
        this.ServerRequest(form_fields, callback);
    }
    //Commit a new device
    AddNewDevice(serial_number, repeat_serial, name, model, year, catchword, inj_body, nozzle, trans_type, callback)
    {
        let form_fields= new FormData();  
        form_fields.set('DEVICE', 'COMMIT');
        form_fields.set('serial_number', serial_number);       
        form_fields.set('serial_number_repeat', repeat_serial);    
        form_fields.set('device_name',name);    
        form_fields.set('year',year);    
        form_fields.set('model',model);    
        form_fields.set('catchword',catchword);    
        form_fields.set('body_size',inj_body);    
        form_fields.set('nozzle_size',nozzle);    
        form_fields.set('transmission',trans_type);  
        this.ServerRequest(form_fields, callback);
    }
    //Request device update 
    UpdateDevice(serial_number, name, model, year, catchword, inj_body, nozzle, trans_type, callback)
    {
        let form_fields= new FormData(); 
        form_fields.set('DEVICE', 'UPDATE_DEVICE');
        form_fields.set('selected_serial_number', serial_number);
        form_fields.set('device_name',name);    
        form_fields.set('year', year);    
        form_fields.set('model', model);    
        form_fields.set('catchword', catchword);    
        form_fields.set('body_size', inj_body);    
        form_fields.set('nozzle_size', nozzle);    
        form_fields.set('transmission', trans_type);  
        this.ServerRequest(form_fields, callback);
        return; 
    }
    //Request a token transfer
    TransferToken(to_email, num_tokens, callback)
    {
        let form_fields= new FormData();        
        form_fields.set('DEVICE', 'TRANSFER_TOKEN'); 
        form_fields.set('transfer_email', to_email);  
        form_fields.set('token_num', num_tokens);  
        this.ServerRequest(form_fields, callback);
    }
    //Request a device transfer
    TransferDevice(serial_number, to_email, callback)
    {
        let form_fields= new FormData();      
        form_fields.set('DEVICE', 'DEVICE_TRANSFER');    
        form_fields.set('transfer_email', to_email);  
        form_fields.set('selected_serial_number', serial_number);     
        this.ServerRequest(form_fields, callback);
    }
    //Request a devie upgrade
    UpgradeDevice(serial_number, callback)
    {
        let form_fields= new FormData();      
        form_fields.set('DEVICE','UPGRADE');     
        form_fields.set('selected_serial_number', serial_number);     
        this.ServerRequest(form_fields, callback);
    }
    //Update the users current transactions 
    UpdateInvoices(limit, callback)
    {
        let form_fields= new FormData();      
        form_fields.set('DEVICE','GET_INVOICES');     
        form_fields.set('limit', limit);     
        this.ServerRequest(form_fields, callback);
    }
    //Gets calibrations and prompts user for download
    DownloadCalibrations(cal_ids, serial_number, callback)
    {
        let form_fields= new FormData();
        form_fields.set('DEVICE','DOWNLOAD_CALIBRATIONS');
        form_fields.set('SELECTED_CALIBRATIONS', JSON.stringify(cal_ids));
        form_fields.set('selected_serial_number', serial_number);     
        this.ServerRequest(form_fields, callback, true);
    }

//Request/Response control
    //Submits a post request to the server
    ServerRequest(formdata, callback, download = false)
    {
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST',this.post_uri, true);  
        if(download){ xhr.responseType = "arraybuffer"}
        else{ xhr.responseType = 'json';}
        xhr.onreadystatechange = function() { this.HandleResponse(xhr, download, callback); }.bind(this);  
        xhr.send(formdata);
    }
    //Handles server response from post request
    HandleResponse(xhr, download, callback)
    {    
        if (xhr.readyState == 4) { 
            switch(xhr.status){
                case 204:
                    this.status_buffer = 'Files failed to download';
                break;
                case 403:
                    this.status_buffer ='User does not have the privilages required!';                       
                break;
                case 443:
                    this.status_buffer ='Missing information fields';
                break;
                case 503:
                    this.status_buffer ='We are currently experiencing heavy load, please try again in a 5 seconds';
                break;       
                case 542:
                    this.status_buffer ='File download failed, try again';
                break;          
                case 200:
                    if(download){
                        try{    
                            let a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            let blob = new Blob([xhr.response]);  
                            let url = window.URL.createObjectURL(blob);
                            a.href = url;
                            a.download = "Calibrations.zip";
                            a.click();
                            window.URL.revokeObjectURL(url);
                            callback(xhr.status);
                            return;
                        }
                        catch(err){//console.log(err);
                        }             
                    }
                    else{
                        try{  
                            xhr.response.forEach(response => {            
                                if('OP_STATUS' in response){
                                    this.status_buffer = response.OP_STATUS;
                                }
                                if('USER_DEVICES' in response){
                                    this.User.SetDevices(response.USER_DEVICES);                    
                                }     
                                if('TOKENS' in response){             
                                    this.User.SetTokens(response.TOKENS); 
                                }
                                if('TRANSACTIONS' in response){
                                    this.User.SetTransactions(response.TRANSACTIONS); 
                                }  
                                if('CALS' in response){          
                                    this.User.SetCals(response.CALS);                         
                                }                   
                            });
                        }
                        catch(err){console.log(err);}     
                    }
                break;

                default:
                    try{
                        xhr.response.forEach(response => {            
                            if('OP_STATUS' in response){
                                this.status_buffer = response.OP_STATUS;
                            }
                        }); 
                    }       
                    catch(err){}       
                break;
            }           
            callback(xhr.status);
        }        
    }
}

class STD_User
{
    tokens;
    transactions;
    devices;
    current_cals;

    tokens_changed;
    transactions_changed;
    devices_changed;
    current_cals_changed;

    constructor()
    {
        this.tokens = 0;
        this.devices = new Array();
        this.transactions = new Array();
        this.current_cals = new Array();
    }
//TOKENS
    //Set the internal token count
    SetTokens(token_num)
    {        
        if(isNaN(parseInt(token_num))){
            this.tokens = 0;
        }else{
            this.tokens = parseInt(token_num);
        }      
        this.tokens_changed = true;
    }
    //Get current tokens and reset the status
    GetTokens()
    {
        this.tokens_changed = false;
        return this.tokens;
    }
//TRANSACTIONS
    //Sets the internal transaction array
    SetTransactions(transactions)
    {
        this.transactions = new Array();
        transactions.forEach(invoice => {
            let new_invoice = new Transaction();
            if(new_invoice.SetFromResponse(invoice)){
                this.transactions.push(new_invoice);
            }
        });      
        this.transactions_changed = true;
    }
    //Get transactions and reset status
    GetTransactions()
    {
        this.transactions_changed = false;
        return this.transactions;
    }
    //Get transaction row
    GetTransaction(index)
    {
        let row = new Array();
        if(this.transactions.length > 0 && index < this.transactions.length){
            row = this.transactions[index];
        }
        this.transactions_changed = false;
        return row;
    }
//DEVICE
    //Sets the internal device array
    SetDevices(device_arr)
    {
        this.devices = new Array();
        device_arr.forEach(device => {
            let new_dev = new Device();
            if(new_dev.SetFromResponse(device)){
                this.devices.push(new_dev);
            }
        });
        this.devices_changed = true;
    }
    //Get devices and reset status
    GetDevices()
    {
        this.devices_changed = false;
        return this.devices;
    }
    //Returns the device at a given index, returns an empty array if index is out of bounds
    GetDevice(index)
    {
        let device = new Array();
        if(index != null){
            if(this.devices.length > 0 && index < this.devices.length)
            {
                device = this.devices[index];
            }
        }
        this.devices_changed = false;
        return device;
    }
    //Returns the number of devices 
    GetNumDevices()
    {
        this.devices_changed = false;
        return this.devices.length;
    }

    //Load all calibration 
    SetCals(cal_arr)
    {
        this.current_cals = new Array();
        cal_arr.forEach(cal => {
            let new_cal = new Calibration();
            if(new_cal.SetFromResponse(cal)){
                this.current_cals.push(new_cal);
            }
        });
        this.current_cals_changed = true;
    }
    //Gets a calibration row
    GetCalibration(index)
    {
        let row = null;
        if(this.current_cals.length > 0 && index < this.current_cals.length){
            row = this.current_cals[index];
        }
        this.current_cals_changed = false;
        return row;
    }
    //Gets the number of current calibrations
    GetNumCals()
    {
        this.current_cals_changed = false;
        return this.current_cals.length;
    }
    //Clears internal calibrations 
    ClearCurCals()
    {
        this.current_cals = new Array();
        this.current_cals_changed = true;
    }
    //Sort Devices 
    SortCals(type, ascend = true)
    {
        switch(type)
        {
            case CalSort.POWER:
                if(ascend){
                    this.current_cals.sort((a,b) => (a.power_level < b.power_level) ? 1 : ((b.power_level < a.power_level) ? -1 : 0)); 
                }else{
                    this.current_cals.sort((a,b) => (a.power_level > b.power_level) ? 1 : ((b.power_level > a.power_level) ? -1 : 0)); 
                }
            break;
            case CalSort.NAME:
                if(ascend){
                    this.current_cals.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); 
                }else{
                    this.current_cals.sort((a,b) => (a.name < b.name) ? 1 : ((b.name < a.name) ? -1 : 0)); 
                }
            break;
            case CalSort.OPTIONS:
                if(ascend){
                    this.current_cals.sort((a,b) => (a.options > b.options) ? 1 : ((b.options > a.options) ? -1 : 0)); 
                }else{
                    this.current_cals.sort((a,b) => (a.options < b.options) ? 1 : ((b.options < a.options) ? -1 : 0)); 
                }
            break;
            case CalSort.DATE:
                if(ascend){
                    this.current_cals.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0)); 
                }else{
                    this.current_cals.sort((a,b) => (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0)); 
                }
            break;
        }
    }
}

class Device{
    serial;
    name;
    year;
    model;
    catchword;
    strategy;
    body_size;
    nozzle_size;
    trans_type;
    upgrade_status;

    constructor(){
    }

    Set(serial, name, year, model, catchword, strategy, body, nozzle, trans, status)
    {
        this.serial = serial;
        this.name = name;
        this.year = year;
        this.model = model;
        this.catchword = catchword;
        this.strategy = strategy;
        this.body_size = body;
        this.nozzle_size = nozzle;
        this.trans_type = trans;
        this.upgrade_status = status
    }

    SetFromResponse(json)
    {
        if(
            'serial'                in json &&
            'device_name'           in json &&
            'year'                  in json &&
            'model'                 in json &&
            'catchword'             in json &&
            'strategy'              in json &&
            'body_size_code'        in json &&
            'nozzle_size_code'      in json &&
            'transmission_type_code' in json &&
            'upgrade_status'        in json 
        ){
            this.Set(
                json['serial'],
                json['device_name'],
                json['year'],
                json['model'],
                json['catchword'],
                json['strategy'], 
                json['body_size_code'],
                json['nozzle_size_code'],
                json['transmission_type_code'],
                json['upgrade_status']
            );
            return true;
        }
        return false;
    }

}
class Calibration{
    id;
    name;
    power_level;
    options;
    date;

    constructor()
    {
    }

    Set(id, name, level, options, date)
    {
        this.id = id;
        this.name = name;
        this.power_level = level;
        this.options = options;
        this.date = date;
    }

    SetFromResponse(json)
    {
        if(
            'id'                in json &&
            'calibration_name'  in json &&
            'power_level'       in json &&
            'power_level'       in json &&
            'date'              in json
        ){
            this.Set(
                json['id'],
                json['calibration_name'],
                json['power_level'],
                json['options'],
                json['date']
            );
            return true;
        }
        return false;
    }

}
class Transaction{
    ref_num;
    confirmation;
    sku;
    from;
    to;
    note;
    quantity;
    date;

    constructor(){
    }

    Set(refrence, confirmation, sku, from, to, note, quantity, date)
    {
        this.ref_num = refrence;
        this.confirmation = confirmation;
        this.sku = sku;
        this.from = from;
        this.to = to;
        this.note = note;
        this.quantity = quantity;
        this.date = date;
    }

    SetFromResponse(json)
    {
        if(
            'reference'     in json &&
            'order_num'     in json &&
            'product_id'    in json &&
            'from'          in json &&
            'to'            in json &&
            'note'          in json &&
            'quantity'      in json &&
            'date'          in json
        ){
            this.Set(
                json['reference'],
                json['order_num'],
                json['product_id'],
                json['from'],
                json['to'],
                json['note'],
                json['quantity'],
                json['date']
            );
            return true;
        }
        return false;
    }

}