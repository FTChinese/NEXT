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
        var xhr = new XMLHttpRequest();
        var url = '/index.php/btob/deluser';
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (xhr.status === 200 && xhr.responseText) {
                console.log ('removed!');
            } else  {
                alert('Something is wrong. Please try later! ');
            }
        };
        var parameters = [
            {key: 'email_list', value: emailListData}
        ].join('&');
        xhr.send(encodeURI(parameters));
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
        };
        xhr.onerror = function() {
            alert('There is an error on the server side. Please try later! ');
        };
        xhr.open('POST', this.action);
        xhr.send(fd);
        return false;
    });

})();
