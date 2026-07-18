const {
    app,
    BrowserWindow,
    BrowserView,
    ipcMain
} = require("electron");

const path = require("path");
const fs = require("fs");


let mainWindow;

let views = [];

let currentIndex = 0;
let controlView;
let controlViewCreated = false;


// 读取网页配置
const pages = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "pages.json"),
        "utf-8"
    )
);



function createWindow() {


    const { screen } = require("electron");
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;

    console.log("主显示器信息:", primaryDisplay);
    console.log("所有显示器:", screen.getAllDisplays());

    mainWindow = new BrowserWindow({

        width: width,
        height: height,

        x: 0,
        y: 0,

        fullscreen: true,

        kiosk: true,

        autoHideMenuBar: true,

        frame: false,

        webPreferences: {

            preload: path.join(
                __dirname,
                "preload.js"
            )

        }

    });



    // 创建两个网页窗口

    pages.forEach((page, index)=>{


        let view = new BrowserView({

            webPreferences: {

                partition:
                index === 0
                ? "persist:ai"
                : "persist:screen"

            }

        });


        view.webContents.loadURL(
            page.url
        );


        const size = mainWindow.getContentBounds();

view.setBounds({

    x: 0,
    y: 0,

    width: size.width,
    height: size.height

});


        views.push(view);


    });



    // 默认显示第一个

    createControlView();
    showPage(0);

    // 强制设置全屏
    mainWindow.setFullScreen(true);
    mainWindow.maximize();

    mainWindow.on("resize", () => {
        const size = mainWindow.getContentBounds();

        if (views[currentIndex]) {
            views[currentIndex].setBounds({
                x: 0,
                y: 0,
                width: size.width,
                height: size.height
            });
        }

        if (controlView) {
            controlView.setBounds({
                x: 20,
                y: size.height - 120,
                width: 120,
                height: 120
            });
        }
    });


}



function showPage(index){

    if(!mainWindow) return;

    const previousView = views[currentIndex];
    if (previousView) {
        mainWindow.removeBrowserView(previousView);
    }

    const targetView = views[index];
    if (targetView) {
        mainWindow.addBrowserView(targetView);
    }

    const size = mainWindow.getContentBounds();

    targetView.setBounds({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
    });

    if (controlView) {
        controlView.setBounds({
            x: 20,
            y: size.height - 120,
            width: 120,
            height: 120
        });
        mainWindow.setTopBrowserView(controlView);
    }

    currentIndex = index;

}



ipcMain.on(
    "switch-page",
    (event, index)=>{

        console.log("收到切换", index);

        showPage(index);

    }
);



app.whenReady()
.then(()=>{

    createWindow();

});

function createControlView(){

    if (controlViewCreated) {
        console.log("控制覆盖层已存在，跳过创建");
        return;
    }

    console.log("开始创建控制覆盖层");

    controlView = new BrowserView({
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    controlView.webContents.loadFile(path.join(__dirname, "index.html"));

    mainWindow.addBrowserView(controlView);
    mainWindow.setTopBrowserView(controlView);

    const size = mainWindow.getContentBounds();
    controlView.setBounds({
        x: 20,
        y: size.height - 120,
        width: 120,
        height: 120
    });

    controlViewCreated = true;
    console.log("控制覆盖层创建完成");

}