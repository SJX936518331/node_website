var express = require('express');
var util = require('util');
var router = express.Router();
var pool = require('../jdbc').pool;
require('../core/CommonUtil');
require('../core/HttpWrapper');
require('../core/SqlClient');
require('../model/model');



/* GET home page. */
router.get('/', function (req, res, next) {
    // var website = req.session.website;
    // if (website) {
    //     res.render('web/index', {
    //         status: 1,
    //         msg: '',
    //         website: website
    //     });
    //     return;
    // }
    var sqlClient = new SqlClient();
    var website = new Website();
    sqlClient.query(website, function (result) {
        if (result != null && result.length > 0) {
            website = result[0];
            // console.log(website);
            res.render('web/index', {
                status: 1,
                msg: 'welcome!',
                website: website
            });
            return;
        }
        res.render('web/index', {
            status: 2,
            msg: 'not found web information!',
            website: null
        });
    });
});

// 增加网站访问量
router.post('/views', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }

    switch (req.body.type) {
        case "website":
            var entity = new Website();
            entity.id = website.id;
            entity.views = parseInt(website.views) + 1;
            break;
        case "picture":
            var entity = new Picture();
            entity.id = req.body.id;
            entity.views = parseInt(req.body.views) + 1;
            break;
        case "e_advantage_photo":
            var entity = new e_advantage_photo();
            entity.id = req.body.id;
            entity.views = parseInt(req.body.views) + 1;
            break;
        case "case_share":
            var entity = new Case_share();
            entity.id = req.body.id;
            break;
        case "case_app":
            var entity = new Case_app();
            entity.id = req.body.id;
            break;
        case "case_wechat":
            var entity = new Case_wechat();
            entity.id = req.body.id;
            break;
        case "case_website":
            var entity = new Case_website();
            entity.id = req.body.id;
            break;
        case "case_system":
            var entity = new Case_system();
            entity.id = req.body.id;
            break;
        case "about_us":
            var entity = new About_us();
            entity.id = req.body.id;
            break;
    }
    var sqlClient = new SqlClient();
    sqlClient.update(entity, function (result) {
        if (result != null && result > 0) {

            res.json({
                status: 1,
                msg: 'success!',
            });
            if (req.body.type == "website") {
                website.views = website.views + 1;
            }
            return;
        }
        res.json({
            status: 2,
            msg: 'add views failed!'
        });
    });
});


// 经典案例-APP
router.get('/case_app', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }
    var sqlClient = new SqlClient();
    var case_app = new Case_app();
    sqlClient.query(case_app, function (result) {
        if (result != null && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                case_app = result[i];
            }

            res.render('web/case_app', {
                website: website,
                case_app: case_app
            });
            return;
        }
        res.render('web/case_app', {
            website: website,
            case_app: case_app
        });
    });
});
// 经典案例-weChat
router.get('/case_wechat', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }
    var sqlClient = new SqlClient();
    var case_wechat = new Case_wechat();
    sqlClient.query(case_wechat, function (result) {
        if (result != null && result.length > 0) {
            case_wechat = result[0];
            res.render('web/case_wechat', {
                website: website,
                case_wechat: case_wechat
            });
            return;
        }
        res.render('web/case_wechat', {
            website: website,
            case_wechat: case_wechat
        });
    });
});
// 经典案例-website
router.get('/case_website', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }

    var sqlClient = new SqlClient();
    var case_website = new Case_website();
    sqlClient.query(case_website, function (result) {
        if (result != null && result.length > 0) {
            case_website = result[0];
            res.render('web/case_website', {
                website: website,
                case_website: case_website
            });
            return;
        }
        res.render('web/case_website', {
            website: website,
            case_website: case_website
        });
    });
});
// 经典案例-case_system
router.get('/case_system', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }

    var sqlClient = new SqlClient();
    var case_system = new Case_system();
    sqlClient.query(case_system, function (result) {
        if (result != null && result.length > 0) {
            case_system = result[0];
            res.render('web/case_system', {
                website: website,
                case_system: case_system
            });
            return;
        }
        res.render('web/case_system', {
            website: website,
            case_system: case_system
        });
    });
});
// 关于我们
router.get('/about_us', function (req, res, next) {
    var website = req.session.website;
    if (!website) {
        res.redirect('/');
        return;
    }

    var sqlClient = new SqlClient();
    var about_us = new About_us();
    sqlClient.query(about_us, function (result) {
        if (result != null && result.length > 0) {
            about_us = result[0];
            res.render('web/about_us', {
                website: website,
                about_us: about_us
            });
            return;
        }
        res.render('web/about_us', {
            website: website,
            about_us: about_us
        });
    });
});

// 案例分享列表
router.post('/case_app/list/query', function (req, res, next) {
    var limitSql = util.format(" order by createtime desc Limit %s,%s ");

    var sqlClient = new SqlClient();
    var case_app = new Case_app();
    sqlClient.query(case_app, function (result) {
        var recordCount = result[0]["count"];
        if (recordCount == 0) {
            res.json({
                status: 3,
                msg: '暂无记录!',
                data: null,
                recordCount: 0
            });
            return;
        }
        sqlClient.query(case_app, function (result) {
            if (result != null && result.length > 0) {
                result.forEach(function (item) {
                    item.createtime = CommonUtil.toDateString(item.createtime);
                });
                res.json({
                    status: 1,
                    msg: '查询成功!',
                    data: result,
                    recordCount: recordCount
                });
            }
        }, null, limitSql);
    }, null, null, true);
});


// index - _e_advantage_photo
// router.get('/index_e_advantage_photo', function (req, res, next) {
//     var e_advantage_photo = req.session.e_advantage_photo;
//     if (e_advantage_photo) {
//         res.json({ status: 1, msg: '', data:e_advantage_photo });
//         return;
//     }
//     var sqlClient = new SqlClient();
//     var e_advantage_photo = new E_advantage_photo();
//     sqlClient.query(e_advantage_photo, function (result) {
//         if (result != null && result.length > 0) {
//             console.log("###  e_advantage_photo query !");
//             req.session.e_advantage_photo = result;
//             res.json({ status: 1, msg: 'success!', data: result });
//             return;
//         }
//         res.json({ status: 2, msg: 'index_e_advantage_photo failed!' });
//     }, null, null);
// });


module.exports = router;