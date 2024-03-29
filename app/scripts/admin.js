(function(){
    var delegate = new Delegate(document.body);

    // MARK: - Click remove user in the table
    delegate.on('click', '.remove-user', function(){
        var t = this.parentElement.tagName;
        var emailList = [];
        var email;
        if (t==='TD') {
            email = this.closest('tr').querySelector('td:nth-child(2)').innerHTML;
            emailList = [email];
        } else if (t === 'TH') {
            var trs = this.closest('table').querySelectorAll('tbody tr');
            for (var i = 0; i < trs.length; i++ ) {
                var tr = trs[i];
                if (tr.querySelector('td input').checked) {
                    email = tr.querySelector('td:nth-child(2)').innerHTML;
                    emailList.push(email);
                }
            }
        } else {
            console.log ('The tag is ' + t);
            return;
        }
        var emailListData = emailList.join('\n');
        console.log (emailListData);
        var xhr = new XMLHttpRequest();
        var url = '/index.php/btob/deluser';
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200 && xhr.responseText) {
                console.log ('removed!');
                updateUserInfo();
            } else  {
                alert('Something is wrong. Please try later! ');
            }
        };
        var parameters = [
            'email_list=' + emailListData
        ].join('&');
        //console.log (parameters);
        xhr.send(encodeURI(parameters));
    });

    delegate.on('click', '.notify-user', function(){
        var tr = this.closest('tr');
        var email = tr.querySelector('[data-type="email"]').innerHTML;
        sendMail([email]);
    });

    delegate.on('click', '.notify-users', function(){
        var trs = document.querySelectorAll('[data-type="users"] tbody tr');
        var emails = [];
        for (var i = 0; i < trs.length; i++) {
            var tr = trs[i];
            var checked = tr.querySelector('[type="checkbox"]').checked;
            if (!checked) {continue;}
            var email = tr.querySelector('[data-type="email"]').innerHTML;
            if (!email || email === '') {continue;}
            emails.push(email);
        }
        if (emails.length === 0) {
            alert('您还没有选中需要通知的用户! ');
            return;
        }
        sendMail(emails);
    });

    delegate.on('change', '.inputfile', function(){
        var fileName = this.value.replace(/^.*\\/g, '');
        var label = document.querySelector('.inputfile-label');
        var labelVal = label.innerHTML;
        if( fileName) {
            label.innerHTML = fileName;
        } else {
            label.innerHTML = labelVal;
        }
    });

    delegate.on('change', '.o-table th input[type=checkbox]', function(){
        var shouldCheck;
        if (this.checked) {
            shouldCheck = true;
        } else {
            shouldCheck = false;
        }
        var inputs = document.querySelectorAll('.o-table tbody input[type=checkbox]');
        for (var i = 0; i < inputs.length;  i++) {
            var input = inputs[i];
            input.checked = shouldCheck;
        } 
    });

    // MARK: - Handle the two add user forms
    delegate.on('submit', 'form', function(){
        var fd = new FormData(this);
        fd.append('vip_type', 'premium');
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            alert ('Your data is successfully submited. Now let us verify the response! ');
            console.log(xhr.responseText);
            updateUserInfo();
        };
        xhr.onerror = function() {
            alert('There is an error on the server side. Please try later! ');
        };
        xhr.open('POST', this.action);
        xhr.send(fd);
        return false;
    });

    function sendMail(emails) {
        var subject = '您的FT中文网会员订阅权限';
        var password = document.querySelector('[name="password"]').value;
        var newline = '%0D%0A%0D%0A';
        var body = '亲爱的读者，' + newline + '欢迎您使用FT中文网的订阅服务。您的账号和订阅权限已经设置好，请用本邮箱点击这里登录：' + newline + 'https://www.chineseft.net' + newline + '您的密码是: ' + newline +  password + newline + 'FT中文网企业订阅服务';
        var bcc = '';
        if (emails.length > 1) {
            var bccs = emails.slice(1);
            bcc = '&bcc=' + bccs.join(',');
        }
        window.open('mailto:' + emails[0] + '?subject=' + subject + '&body=' + body + bcc);
    }

    function updateUserInfo() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', window.userInfo);
        xhr.onload = function() {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);
                var rows = '';
                var keys = Object.keys(data);
                for (var i=0; i < keys.length; i++) {
                    var key = keys[i];
                    rows += '<tr data-user-id="' + key + '"><td class="o-table__cell--numeric"><input type="checkbox"></td><td class="o-table__cell--numeric" data-type="email">' + data[key].email + '</td><td class="o-table__cell--numeric" data-type="username">' + data[key].user_name + '</td><td class="o-table__cell--numeric o-table-actions"><a class="remove-user">Remove</a> | <a class="notify-user" title="发邮件告知用户">Notify</a></td></tr>';
                }
                var table = '';
                table += '<table data-type="users" class="o-table o-table--horizontal-lines o-table--responsive-overflow" data-o-component="o-table" data-o-table-responsive="overflow">';
                table += '<thead>';
                table += '    <tr>';
                table += '        <th data-column-default-sort="ascending" scope="col" role="columnheader" data-o-table-data-type="number" class="o-forms-input--checkbox"><input type="checkbox"></th>';
                table += '        <th data-column-default-sort="ascending" scope="col" role="columnheader" data-o-table-data-type="number">Email</th>';
                table += '        <th data-column-width scope="col" role="columnheader" data-o-table-data-type="number">Name</th>';
                table += '        <th data-column-width scope="col" role="columnheader" data-o-table-data-type="number">Action</th>';
                table += '    </tr>';
                table += '</thead>';
                table += '<tbody>';
                table += rows;
                table += '</tbody>';
                table += '</table>';
                document.querySelector('.o-table-scroll-wrapper').innerHTML = table;
            } else {
                console.log('Request failed.  Returned status of ' + xhr.status);
            }
        };
        xhr.send();
    }

    updateUserInfo();

})();
