/**
 * Created by Administrator on 2017/1/5.
 */

// 主页面 数据加载
// var app1 = angular.module('index', []);
// app1.controller('indexCtrl', function ($scope, $sce) {
//     $scope.e_advantage_photolist = [];
//     $scope.loadE_advantage_photo = function () {
//         $.ajax({
//             url: "/index_e_advantage_photo",
//             type: "get",
//             dataType: "json",
//             success: function (data) {
//                 if (data.status == 1) {
//                     $scope.e_advantage_photolist = data.data;
//                     $scope.$apply();
//                 } else {
//                     toastrShow(data.status, data.msg);
//                 }
//             }
//         });
//     };
//     $scope.loadE_advantage_photo();
// });

angular.element(document).ready(function () {
    angular.bootstrap(document.getElementById('indexpage'), ['index']);
});