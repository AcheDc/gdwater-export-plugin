// content.js
const token = localStorage.getItem("token"); // 从本地存储中获取 token
let resCodeList = []; // 水库列表
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 分钟

async function fetchWithCache(url) {
  const cacheKey = `cache_${url}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
          return data;
      } else {
          localStorage.removeItem(cacheKey); // 清除过期缓存
      }
  }

  const response = await fetch(url,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        terminal: "CONSOLE",
        token: token,
      },
    }
  );
  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

// 获取水库列表
const getResCodeList = async () => {
  try {
    if (!token) {
      console.error("请先获取token");
      return;
    }

    // 使用 fetch 获取接口数据
    return await fetchWithCache(
      "https://sk.gdwater.gov.cn:8000/api/base/att-res-base/page?userId=44236&pageNum=1&pageSize=100000&addvcd=440118000000"
    )
      .then((res) => {
        const ret = res.data.list;

        // 构建正则表达式
        const regex = /(大封门|余家庄|白水寨|吊钟|山角|竹坑|长冚|木潭|流杯|石马龙|石寨|牛牯嶂|拖罗|银场|万田|高埔|白水带|丹邱深冚|水磨窿二级|山猪窿|白鹤争虾|寒洞|背带窿|大汾河|罗塘|何坑|石古窿|香车窿|盐蛇窿|河大塘|沙岗|张山冚1 副坝|长布|长冚尾|正果洋|石坣|明山寺|古塘|莲塘|黄村|山猪冚|莲塘|杉山冚|河坑|公冚|车冚|陈屋冚|鸡心岭|洞冚|合罗岗|梅花庄|茅冚|大坑冚|牛皮冚|银湖|鸡公山|牛角石|山田深冚|下小磜|塘面|新广|杨村|水养|吓迳|打铁冚|八坑|大山2副坝|汴窿|塘头|门洞窿|料桥坑|大埔围下|唱歌窿|鸡爪窿|西坑|茅岗|崩坑|牧场坑|灿禾田|陈家林|郭村|坑底|沙贝窿|猪牯窿|蕉窿|大山|张山冚|灿和田|汴冚|鸡爪冚|唱歌冚|水磨冚II级|大埔围（下）)水库/g;
        const matchList = ret.filter(item => item.resName.match(regex) !== null);
        return matchList;
      });
  } catch (error) {
    console.error("Error:", error);
  }
};

(async function () {
  resCodeList = await getResCodeList();
  console.log("🚀水库数量", resCodeList.length);
})();

// 导出按钮
const button = document.createElement("button");
button.textContent = "一键导出";
button.style.background = "#36b29e"; // 添加背景渐变色
button.style.border = "1px solid #36b29e"; // 去除边框
button.style.color = "white"; // 设置文字颜色
button.style.padding = "6px 10px"; // 设置内边距
button.style.borderRadius = "3px"; // 设置圆角
button.style.cursor = "pointer"; // 设置鼠标悬停样式
button.style.fontSize = "12px"; // 设置鼠标悬停样式
button.style.marginLeft = "10px"; // 设置鼠标悬停样式

setTimeout(() => {
  // 按钮位置
  const targetElement = document.querySelector(
    // "#box > div.txjc-right > div.chart-wrap > div.date-mini-single"
    "#area > div > div.el-tree-node.is-expanded.is-focusable > div.el-tree-node__children > div:nth-child(3) > div.el-tree-node__children > div:nth-child(1) > div.el-tree-node__content"
  );
  // console.log(targetElement);
  if (!targetElement) {
    button.style.position = "fixed";
    button.style.bottom = "10px";
    button.style.right = "10px";
    document.body.appendChild(button);
  } else {
    button.style.padding = "3px 5px"; // 设置内边距
    targetElement.appendChild(button);
  }
}, 500);

// 获取测站编码列表
const getSiteCodeList = async (resCode) => {
  try {
    if (!token) {
      console.error("请先获取token");
      return;
    }

    // 使用 fetch 获取接口数据
    return await fetchWithCache(
      `https://sk.gdwater.gov.cn:8000/api/equipment/iot-point-m/page?resCode=${resCode}&type=4&pageNum=1&pageSize=100000`,
    )
      .then((res) => {
        const ret = res.data.list;
        return ret;
      });
  } catch (error) {
    console.error("Error:", error);
  }
};

// 点击事件
button.addEventListener("click", async (event) => {
  event.stopPropagation(); // 阻止事件冒泡
  if (!token) {
    console.error("请先获取token");
    return;
  }

  // 获取 beginDate
  const beginDateInput = document.querySelector(
    "#box > div.txjc-right > div.chart-wrap > div.date-mini-single > div.el-date-editor.mgr10.el-input.el-input--mini.el-input--prefix.el-input--suffix.el-date-editor--date > input"
  );
  const beginDate = beginDateInput.value;

  // 获取 endDate
  const endDateInput = document.querySelector(
    "#box > div.txjc-right > div.chart-wrap > div.date-mini-single > div:nth-child(2) > input"
  );
  const endDate = endDateInput.value;

  if (!beginDate || !endDate) {
    console.error("请先选择日期");
    return;
  }

  // 获取渗流渗压监测数据
  const getPressureList = async ({ resCode, siteCode, mpCode }) => {
    try {
      // 使用 fetch 获取接口数据
      return await fetch(
        `https://sk.gdwater.gov.cn:8000/api/magic/composite/pressure-list?siteCode=${siteCode}&resCode=${resCode}&beginDate=${beginDate}&endDate=${endDate}&mpCode=${mpCode}`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            terminal: "CONSOLE",
            token: token,
          },
        }
      )
        .then((response) => response.json())
        .then((res) => {
          const ret = res.data.list;
          return ret;
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // getPressureList();

  let exportList = []; // 导出结构
  function insertData(rowIndex, colIndex, data) {
    // 确保行索引存在
    if (!exportList[rowIndex]) {
      exportList[rowIndex] = [];
    }

    if (colIndex !== -1) {
      // 插入数据
      exportList[rowIndex][colIndex] = data;
    } else {
      exportList[rowIndex] = data;
    }
  }
  let tempRowIndex = 0;
  for (const { resCode, resName } of resCodeList) {
    const siteCodeList = await getSiteCodeList(resCode); // 测点列表
    insertData(tempRowIndex, -1, [
      resName,
      ...siteCodeList.map((item) => item.name),
    ]); // 行列名：水库名、...测点名

    // let count = 0;
    // for (const [colIndex, { siteCode, code }] of siteCodeList.entries()) {
    //   const realColIndex = colIndex + 1;
    //   const pressureList = await getPressureList({
    //     resCode,
    //     siteCode,
    //     mpCode: code,
    //   }); // 渗压数据
    //   // 特殊时间点的数据
    //   const timePointPressureList = pressureList.filter((item) => {
    //     const isTimePoint = /\d{4}-\d{1,2}-(07|14|21|28) 00:00/.test(item.time);
    //     return isTimePoint;
    //   }).sort((a, b) => {
    //     return new Date(a.time) - new Date(b.time);
    //   });

    //   count = Math.max(count, timePointPressureList.length);
    //   for (const [rowIndex, item] of timePointPressureList.entries()) {
    //     const realRowIndex = tempRowIndex + rowIndex + 1;

    //     insertData(realRowIndex, 0, item.time); // 列列名
    //     insertData(realRowIndex, realColIndex, item.osmotic); // 监测数据
    //   }
    // }
    // 使用 Promise.all 来并行处理所有的 getPressureList 调用
    const promises = siteCodeList.entries().map(async ([colIndex, { siteCode, code }]) => {
      const realColIndex = colIndex + 1;
      const pressureList = await getPressureList({
        resCode,
        siteCode,
        mpCode: code,
      }); // 渗压数据

      // 特殊时间点的数据
      const timePointPressureList = pressureList.filter((item) => {
        const isTimePoint = /\d{4}-\d{1,2}-(07|14|21|28) 00:00/.test(item.time);
        return isTimePoint;
      }).sort((a, b) => {
        return new Date(a.time) - new Date(b.time);
      });

      return { realColIndex, timePointPressureList };
    });

    // 等待所有的 Promise 完成
    const results = await Promise.all(promises);

    // 处理结果
    let count = 0;
    for (const { realColIndex, timePointPressureList } of results) {
      count = Math.max(count, timePointPressureList.length);
      for (const [rowIndex, item] of timePointPressureList.entries()) {
        const realRowIndex = tempRowIndex + rowIndex + 1;

        insertData(realRowIndex, 0, item.time); // 列列名
        insertData(realRowIndex, realColIndex, item.osmotic); // 监测数据
      }
    }
    tempRowIndex += count + 2;
  }

  // 调用函数将数据导出为 Excel
  exportDataToExcel(exportList, { beginDate, endDate });
});

function exportDataToExcel(data, { beginDate, endDate }) {
  // 这里假设 data 是从接口获取的数据
  const worksheet = XLSX.utils.json_to_sheet(data, { header: [] });
  const workbook = XLSX.utils.book_new();
  const name = `${beginDate}~${endDate}在线监测渗压数据导出`;
  XLSX.utils.book_append_sheet(workbook, worksheet, `${beginDate}~${endDate}`);
  XLSX.writeFile(workbook, `${name}.xlsx`);
}
