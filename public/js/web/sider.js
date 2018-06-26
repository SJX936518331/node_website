// /**
//  * Created by Administrator on 2017/1/5.
//  */

// // 左侧公共菜单
var app = angular.module('sider', []);
app.controller('siderCtrl', function ($scope, $sce) {
    $scope.case_sharelist = [];
    $scope.loadCase_share = function () {
        $.ajax({
            url: "/sider_case_share",
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 1) {
                    $scope.case_sharelist = data.data;
                    $scope.$apply();
                } else {
                    toastrShow(data.status, data.msg);
                }
            }
        });
    };

    $scope.loadCase_share();
});