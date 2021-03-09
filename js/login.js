var userId;
var pw;

function gettoken()
{
    var url ="https://fujitsu-test--fujitsu.my.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG9z6NAroNkeMlk447rDJJHtVFvqArw.IlXOdObKRw9heB8nDsJTk5k0U9odXzLwGD1WtQ3yLZPWiFRLd38&client_secret=67443D19FEC05C53412462019590A6B8BB952D15EC8ACC160115759A89450F0B&username=yaojianbin@pkutech.co.jp_fujitsu&password=fujitsutest2021";
    $.ajax({
        url: url,
        type: 'POST',
        Accept: "application/json",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {
        localStorage.setItem("access_token",data.access_token);
        localStorage.setItem("token_type",data.token_type);
        localStorage.setItem("user_id",userId);
        // 跳转到模版页面
        window.location.href = "homepage.html?"+"userId="+userId;
        }

    });
}
  

function loginFn(){
    userId = document.getElementById('user_id').value;
    pw = document.getElementById('password').value;
    gettoken();
    
}   