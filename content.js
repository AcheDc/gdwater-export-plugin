// content.js

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.params) {
//     console.log('Received message in content script:', request.params);
//     sendResponse({ status: 'Message received' });
//   } else {
//     sendResponse({ status: 'No params received' });
//   }
// });

const token = localStorage.getItem("token"); // 从本地存储中获取 token
// console.log(token);
let resCodeList = []; // 水库列表
let siteCodeList = []; // 测站编码列表

// 获取水库列表
const getResCodeList = async () => {
  try {
    if (!token) {
      console.error("请先获取token");
      return;
    }

    // 使用 fetch 获取接口数据
    return await fetch(
      "https://sk.gdwater.gov.cn:8000/api/base/att-res-base/select-user-res-history",
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
        const ret = res.data;
        return ret;
      });
  } catch (error) {
    console.error("Error:", error);
  }
};

// 获取测站编码列表
const getSiteCodeList = async (resCode) => {
  try {
    if (!token) {
      console.error("请先获取token");
      return;
    }

    // 使用 fetch 获取接口数据
    return await fetch(
      `https://sk.gdwater.gov.cn:8000/api/equipment/iot-point-m/page?resCode=${resCode}&pageNum=1&pageSize=100000`,
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

(async function () {
  resCodeList = await getResCodeList();
  console.log("水库列表 =====", resCodeList);
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

// // 定义要监听的选择器
// const targetSelector =
//   "#area > div > div.el-tree-node.is-expanded.is-focusable > div.el-tree-node__children > div:nth-child(3) > div.el-tree-node__children > div:nth-child(1) > div.el-tree-node__content";

// // 定义回调函数，当目标元素被添加到 DOM 时触发
// const callback = function (mutationsList, observer) {
//   for (let mutation of mutationsList) {
//     if (mutation.type === "childList") {
//       const targetElement = document.querySelector(targetSelector);
//       if (targetElement) {
//         // 目标元素存在，执行相应操作
//         console.log("目标元素已存在，触发操作");
//         // 在这里添加你需要执行的代码
//         button.style.padding = "3px 5px"; // 设置内边距
//         targetElement.appendChild(button);

//         // 停止观察，因为我们已经找到了目标元素
//         observer.disconnect();
//         break;
//       } else {
//         // 目标元素不存在，继续观察
//         button.style.position = "fixed";
//         button.style.bottom = "10px";
//         button.style.right = "10px";
//         document.body.appendChild(button);
//       }
//     }
//   }
// };

// // 创建一个 MutationObserver 实例并传入回调函数
// let observer = new MutationObserver(callback);

// // 配置观察选项
// const config = { childList: true, subtree: true };

// // 定义一个函数来启动观察器
// function startObserving() {
//   // 确保在启动之前停止任何现有的观察器
//   observer.disconnect();
//   // 重新创建观察器并开始观察
//   observer = new MutationObserver(callback);
//   observer.observe(document.body, config);
// }

// // 开始初始观察
// startObserving();

// // 添加窗口大小改变事件监听器
// window.addEventListener('resize', () => {
//     console.log('窗口大小改变，重新启动观察器');
//     startObserving();
// });

setTimeout(() => {
  // 按钮位置
  const targetElement = document.querySelector(
    // "#box > div.txjc-right > div.chart-wrap > div.date-mini-single"
    "#area > div > div.el-tree-node.is-expanded.is-focusable > div.el-tree-node__children > div:nth-child(3) > div.el-tree-node__children > div:nth-child(1) > div.el-tree-node__content"
  );
  console.log(targetElement);
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

  console.log("Begin Date:", beginDate);
  console.log("End Date:", endDate);

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
          const { list, titles } = res.data;
          return list;

          // 使用转换函数
          // const transformedList = transformList(list, titles);

          // 调用函数将数据导出为 Excel
          // exportDataToExcel(transformedList, {beginDate, endDate});
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
    let siteCodeList = await getSiteCodeList(resCode); // 测点列表
    siteCodeList = siteCodeList.filter((item) => item.type === 4);
    insertData(tempRowIndex, -1, [
      resName,
      ...siteCodeList.map((item) => item.name),
    ]); // 行列名：水库名、...测点名

    let count = 0;
    for (const [colIndex, { siteCode, code }] of siteCodeList.entries()) {
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

      count = Math.max(count, timePointPressureList.length);
      for (const [rowIndex, item] of timePointPressureList.entries()) {
        const realRowIndex = tempRowIndex + rowIndex + 1;

        insertData(realRowIndex, 0, item.time); // 列列名
        insertData(realRowIndex, realColIndex, item.osmotic); // 监测数据
      }
    }
    tempRowIndex += count + 2;
  }

  console.log("END 导出结果 =====", exportList);
  // 调用函数将数据导出为 Excel
  exportDataToExcel(exportList, { beginDate, endDate });
});

// function transformList(list, titles) {
//   return list.map(item => {
//     const transformedItem = {};
//     titles.forEach(title => {
//       transformedItem[title.name] = item[title.field];
//     });
//     return transformedItem;
//   });
// }

function exportDataToExcel(data, { beginDate, endDate }) {
  // 这里假设 data 是从接口获取的数据
  const worksheet = XLSX.utils.json_to_sheet(data, { header: [] });
  const workbook = XLSX.utils.book_new();
  const name = `${beginDate}~${endDate}在线监测渗压数据导出`;
  XLSX.utils.book_append_sheet(workbook, worksheet, `${beginDate}~${endDate}`);
  XLSX.writeFile(workbook, `${name}.xlsx`);
}
