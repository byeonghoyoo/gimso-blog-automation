// ✅ 유튜브 [ai자동화 복붙코딩]이 제작한 것으로 임의 수정 배포하시면 안됩니다.


//✅ChatGPT 자동 실행 + 블로그 제목/본문/사용자 프롬프트 복사 붙혀넣기 기능 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectPrompt") {
        const inputSelector = 'div[contenteditable="true"]';
        const maxRetries = 15;
        let retryCount = 0;

        const tryInput = () => {
            const inputBox = document.querySelector(inputSelector);
            if (inputBox) {
                inputBox.focus();
                document.execCommand("insertText", false, request.text);

                setTimeout(() => {
                    const enterEvent = new KeyboardEvent("keydown", {
                        bubbles: true,
                        cancelable: true,
                        key: "Enter",
                        code: "Enter",
                        which: 13,
                        keyCode: 13
                    });
                    inputBox.dispatchEvent(enterEvent);
                    console.log("✅ ChatGPT 입력 후 엔터 실행 완료!");

                    // ✅ 4초 후 스크롤 실행
                    setTimeout(() => {
                        forceScrollToBottom();
                    }, 4000);

                    sendResponse({ success: true });
                }, 1000);
            } else if (retryCount < maxRetries) {
                retryCount++;
                console.warn(`⏳ 입력창을 찾을 수 없습니다. 재시도 중... (${retryCount}/${maxRetries})`);
                setTimeout(tryInput, 500);
            } else {
                console.error("❌ ChatGPT 입력 필드를 찾을 수 없습니다. (최대 재시도 초과)");
                sendResponse({ success: false });
            }
        };

        tryInput();
        return true;
    }
});



// ✅ 올바른 채팅창 컨테이너를 찾아 강제 스크롤하는 함수
function forceScrollToBottom() {
    console.log("⏳ 페이지 맨 아래로 스크롤 중...");

    // ✅ ChatGPT 채팅창 컨테이너 탐색
    const selectors = [
        "div[class*='react-scroll-to-bottom'] > div",
        "div[class*='chat-scroll']",
        "main div[tabindex='0']",
        "div[class='flex h-full flex-col overflow-y-auto [scrollbar-gutter:stable]']"
    ];

    let chatContainer = null;
    for (const selector of selectors) {
        chatContainer = document.querySelector(selector);
        if (chatContainer) break;
    }

    if (chatContainer) {
        console.log("✅ 올바른 채팅 컨테이너 찾음:", chatContainer);

        let attempts = 0;
        let scrollInterval = setInterval(() => {
            // ✅ 현재 복사 버튼이 존재하는지 체크
            let copyButton = document.querySelector("button[aria-label='복사'][data-testid='copy-turn-action-button']");
            
            if (copyButton) {
                console.log("✅ 복사 버튼 발견! 스크롤 중단 및 클릭 실행...");
                clearInterval(scrollInterval);  // ⛔ 스크롤 중단
                clickCopyButton();  // 🔘 본문 복사 실행
                return;
            }

            // ✅ 스크롤 계속 진행
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
            console.log(`⬇️ 스크롤 진행 중... (${attempts + 1}/150)`);

            attempts++;
            if (attempts >= 150) { // ⏳ 150회(=75초) 진행 후 중단
                clearInterval(scrollInterval);
                console.log("✅ 페이지 맨 아래로 스크롤 완료!");
            }
        }, 500);
    } else {
        console.error("❌ 올바른 ChatGPT 채팅 컨테이너를 찾을 수 없습니다.");
    }
}


// ✅ 복사 버튼 클릭 및 HTML 서식 복사 기능 추가
function clickCopyButton() {
    console.log("🔹 복사 버튼 클릭 실행...");

    // ✅ 복사 버튼을 찾기
    let copyButton = document.querySelector("button[aria-label='복사'][data-testid='copy-turn-action-button']");

    if (copyButton) {
        console.log("✅ 복사 버튼 발견! 강제 클릭 실행...");

        // ✅ 실제 마우스 클릭처럼 이벤트 발생 (버튼이 정상 작동하도록 보장)
        copyButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
        copyButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
        copyButton.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

        console.log("✅ 마크다운 복사 버튼 클릭 완료!");

        // ✅ 복사 버튼 클릭 후 HTML 서식 유지하여 복사 실행
        setTimeout(copyHtmlContent, 1000);
    } else {
        console.error("❌ 복사 버튼을 찾을 수 없습니다.");
    }
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// ✅ 네이버 블로그 작성 페이지인지 확인하는 함수 (URL 검사 정확도 향상)
function isNaverBlogWritePage() {
    return window.location.href.startsWith("https://blog.naver.com/PostWriteForm.naver");
}

// ✅ HTML 서식 유지한 채 클립보드 저장 및 복사 기능 추가
async function copyHtmlContent() {
    console.log("📋 HTML 서식 유지 복사 실행...");

    // ✅ ChatGPT의 채팅 내용 가져오기 (서식 유지)
    const chatContent = document.querySelector("div[class*='prose']"); // ChatGPT 채팅 내용 영역

    if (chatContent) {
        console.log("✅ 채팅 내용 가져오기 성공!", chatContent.innerHTML);

        try {
            // ✅ 클립보드에 저장
            console.log("✅ 마크다운 클립보드에 복사 완료(네이버) / 복사 안되면 수동으로 복사 필요");

            // ✅ 네이버 & 티스토리 ID 불러오기
            chrome.storage.local.get(["savedNaverId", "savedTistoryId"], (data) => {
                const naverId = data.savedNaverId || "ai자동화";                    //✅ 필히 수정 할것
                const tistoryId = data.savedTistoryId || "ai자동화";                //✅필히 수정 할것

            // ✅ 깜빡이는 애니메이션 스타일 추가
            const style = document.createElement("style");
            style.innerHTML = `
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
                .blink-button {
                    animation: blink 1s infinite alternate;
                    border: 3px solid white;
                    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.8);
                }
            `;
            document.head.appendChild(style);

            // ✅ 티스토리 블로그 이동 버튼
            const copyButton = document.createElement("button");
            copyButton.innerText = "📋 티스토리 블로그";
            copyButton.classList.add("blink-button"); // 🔥 깜빡이게 적용
            copyButton.style = `
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                padding: 12px 18px; background:rgb(224, 187, 0); color: white; font-size: 16px;
                font-weight: bold; border: none; cursor: pointer; border-radius: 8px;
            `;

            // ✅ 네이버 블로그 이동 버튼
            const naverButton = document.createElement("button");
            naverButton.innerText = " ✅ 네이버 블로그 ";
            naverButton.classList.add("blink-button"); // 🔥 깜빡이게 적용
            naverButton.style = `
                position: fixed; bottom: 70px; right: 20px; z-index: 9999;
                padding: 12px 18px; background:rgb(0, 232, 15); color: white; font-size: 16px;
                font-weight: bold; border: none; cursor: pointer; border-radius: 8px;
            `;

            // ✅ 복사 버튼 클릭 이벤트
            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(chatContent.innerHTML);

                    console.log("✅ html 클립보드에 복사 완료(티스토리)");

                    // ✅ 티스토리 블로그 작성 페이지로 이동
                    setTimeout(() => {
                        window.open(`https://${tistoryId}.tistory.com/manage/newpost/`, "_blank");
                    });

                    // ✅ 버튼 제거
                    copyButton.remove();
                    naverButton.remove();
                } catch (err) {
                    console.error("❌ 클립보드 접근 실패:", err);
                }
            });

            // ✅ 네이버 블로그 이동 버튼 클릭 시 페이지 이동
            naverButton.addEventListener("click", () => {
                window.open(`https://blog.naver.com/PostWriteForm.naver?blogId=${naverId}`, "_blank");
            });

            // ✅ 버튼을 화면에 추가
            document.body.appendChild(naverButton);
            document.body.appendChild(copyButton);

        });
    } catch (err) {
        console.error("❌ 클립보드 저장 실패:", err);
    }
} else {
    console.error("❌ 채팅 내용을 찾을 수 없습니다.");
}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ✅ 네이버 검색 페이지 우측 영역에 "AI 자동화 복붙코딩 유튜브" 메뉴 추가1
// function addAIAutomationMenu() {
//     const targetSelector = "div#sub_pack"; // ✅ 네이버 검색 우측 영역 선택
//     const rightPanel = document.querySelector(targetSelector);

//     if (!rightPanel) {
//         console.warn("❌ 네이버 검색 페이지에서 우측 영역을 찾을 수 없습니다.");
//         return;
//     }

//     // ✅ 중복 추가 방지
//     if (document.getElementById("aiAutomationBox")) {
//         console.warn("⚠️ 'AI 자동화' 메뉴가 이미 추가되어 있습니다.");
//         return;
//     }

//     // ✅ 새로운 메뉴 박스 생성
//     const menuBox = document.createElement("section");
//     menuBox.className = "sc_new sp_related dt_banner";
//     menuBox.id = "aiAutomationBox";
//     menuBox.innerHTML = `
//         <div class="api_subject_bx">
//             <div class="mod_title_area">
//                 <div class="title_wrap"><h2 class="title">AI 자동화 복붙코딩</h2></div>
//                 <div class="title_sub"><span class="btn_report"><span class="txt">유튜브 채널</span></span></div>
//             </div>
//             <div class="api_common_banner">
//                 <a class="spnew_bf item" target="_blank" title="AI 자동화 유튜브 채널" href="https://www.youtube.com/@ai자동화">
//                     <div class="dsc_area">
//                         <strong class="elss tit">AI 자동화 유튜브 채널</strong>
//                         <p class="elss dsc">복붙코딩 & 자동화 정보 제공</p>
//                     </div>
//                 </a>
//                 <a class="spnew_bf item" target="_blank" title="ChatGPT & 넷플릭스 할인" href="https://www.gamsgo.com/partner/QZ3J4Cva">
//                     <div class="dsc_area">
//                         <strong class="elss tit">ChatGPT & 넷플릭스 할인</strong>
//                         <p class="elss dsc">AI 도구 & 프리미엄 서비스 할인</p>
//                     </div>
//                 </a>
//                 <a class="spnew_bf item" target="_blank" title="쿠팡 특가 상품" href="https://link.coupang.com/a/ceqmAJ">
//                     <div class="dsc_area">
//                         <strong class="elss tit">쿠팡 특가 상품</strong>
//                         <p class="elss dsc">최저가 할인 정보</p>
//                     </div>
//                 </a>
//                 <a class="spnew_bf item" target="_blank" title="알리익스프레스 쇼핑" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
//                     <div class="dsc_area">
//                         <strong class="elss tit">알리익스프레스 쇼핑</strong>
//                         <p class="elss dsc">해외 직구 할인</p>
//                     </div>
//                 </a>
//             </div>
//         </div>
//     `;

//     // ✅ 네이버 검색 우측 패널에 추가
//     rightPanel.insertBefore(menuBox, rightPanel.firstChild);
//     console.log("✅ 'AI 자동화 복붙코딩' 메뉴가 추가되었습니다!");
// }

// // ✅ 네이버 검색 페이지에서 실행
// if (window.location.href.includes("search.naver.com/search.naver")) {
//     addAIAutomationMenu();
// }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ✅ 네이버 검색 페이지 우측 영역에 "AI 자동화 복붙코딩 유튜브" 메뉴 추가2
async function addAIAutomationMenu() {
    const targetSelector = "div#sub_pack"; // ✅ 네이버 검색 우측 영역 선택
    const rightPanel = document.querySelector(targetSelector);

    if (!rightPanel || document.getElementById("aiAutomationBox")) return;

    // ✅ Google Apps Script URLs
    const TITLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec"; 
    const CHANNEL_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec";
    const YOUTUBE_TITLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec";
    const YOUTUBE_LINK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec";
    const DESCRIPTION_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec";

    // ✅ 기본값 설정 (즉시 표시)
    let newTitle = "📺 AI 자동화 복붙코딩"; 
    let newChannelText = "유튜브 채널"; 
    let newYoutubeTitle = "AI 자동화 유튜브 채널"; 
    let newYoutubeLink = "https://www.youtube.com/@ai자동화"; 
    let newDescription = "복붙코딩 & 자동화 정보 제공"; 

    // ✅ HTML 요소를 먼저 추가하여 기본값 표시
    const menuBox = document.createElement("section");
    menuBox.className = "sc_new sp_related dt_banner";
    menuBox.id = "aiAutomationBox";
    menuBox.innerHTML = `
        <div class="api_subject_bx">
            <div class="mod_title_area">
                <div class="title_wrap"><h2 class="title">${newTitle}</h2></div>
                <div class="title_sub"><span class="btn_report"><span class="txt">${newChannelText}</span></span></div>
            </div>
            <div class="api_common_banner">
                <a class="spnew_bf item" target="_blank" title="${newYoutubeTitle}" href="${newYoutubeLink}" id="youtube-link">
                    <div class="dsc_area">
                        <strong class="elss tit" id="youtube-title">${newYoutubeTitle}</strong>
                        <p class="elss dsc" id="youtube-description">${newDescription}</p>
                    </div>
                </a>
                <a class="spnew_bf item" target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                    <div class="dsc_area">
                        <strong class="elss tit">ChatGPT & 넷플릭스 할인 🎬</strong>
                        <p class="elss dsc">AI 도구 & 프리미엄 서비스 할인</p>
                    </div>
                </a>
                <a class="spnew_bf item" target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                    <div class="dsc_area">
                        <strong class="elss tit">쿠팡 특가 상품 🎁</strong>
                        <p class="elss dsc">최저가 할인 정보</p>
                    </div>
                </a>
                <a class="spnew_bf item" target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                    <div class="dsc_area">
                        <strong class="elss tit">알리익스프레스 쇼핑 🛒</strong>
                        <p class="elss dsc">해외 직구 할인</p>
                    </div>
                </a>
                 <a class="spnew_bf item" target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                    <div class="dsc_area">
                        <strong class="elss tit">아고다 항공 숙박 할인 ✈️</strong>
                        <p class="elss dsc">예약 무료 취소 가능</p>
                    </div>
                </a>
            </div>
        </div>
    `;

    // ✅ 네이버 검색 우측 패널에 추가 (기본값 먼저 표시)
    rightPanel.insertBefore(menuBox, rightPanel.firstChild);

    // ✅ Google Apps Script 데이터를 비동기적으로 가져와 업데이트
    try {
        const [titleRes, channelRes, youtubeTitleRes, youtubeLinkRes, descriptionRes] = await Promise.all([
            fetch(TITLE_SCRIPT_URL).then(res => res.ok ? res.text() : newTitle),
            fetch(CHANNEL_SCRIPT_URL).then(res => res.ok ? res.text() : newChannelText),
            fetch(YOUTUBE_TITLE_SCRIPT_URL).then(res => res.ok ? res.text() : newYoutubeTitle),
            fetch(YOUTUBE_LINK_SCRIPT_URL).then(res => res.ok ? res.text() : newYoutubeLink),
            fetch(DESCRIPTION_SCRIPT_URL).then(res => res.ok ? res.text() : newDescription)
        ]);

        // ✅ 요소를 업데이트
        document.querySelector("#aiAutomationBox .title").innerText = titleRes;
        document.querySelector("#aiAutomationBox .txt").innerText = channelRes;
        document.querySelector("#youtube-title").innerText = youtubeTitleRes;
        document.querySelector("#youtube-link").href = youtubeLinkRes;
        document.querySelector("#youtube-description").innerText = descriptionRes;
    } catch (error) {
        console.warn("데이터를 불러오지 못했습니다.");
    }
}

// ✅ 네이버 검색 페이지에서 실행
if (window.location.href.includes("search.naver.com/search.naver")) {
    addAIAutomationMenu();
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ manifest.json에 웹사이트 주소 추가 필요함
// "content_scripts": [
//     {
//       "matches": [
//        ✅ "https://m.search.naver.com/*"

// ✅ 네이버 모바일 검색 상단 영역에 "AI 자동화 유튜브" 메뉴 추가
async function addAIAutomationYouTubeTab() {
    console.log("🔍 [AI 유튜브 탭] 네이버 검색 탭 추가 시도...");

    // ✅ 네이버 검색 탭 영역 찾기
    const tabContainer = document.querySelector(".api_flicking_wrap");

    if (!tabContainer) {
        console.warn("❌ [AI 유튜브 탭] 네이버 검색 탭을 찾을 수 없습니다.");
        return;
    }

    console.log("✅ [AI 유튜브 탭] 네이버 검색 탭 영역 발견!");

    // ✅ 중복 추가 방지
    if (document.getElementById("aiAutomationYouTubeTab")) {
        console.warn("⚠️ [AI 유튜브 탭] 이미 추가되어 있습니다.");
        return;
    }

    // ✅ 기본값 (즉시 표시)
    let youtubeTabText = "AI 자동화 유튜브";
    let youtubeLink = "https://www.youtube.com/@ai자동화";

    // ✅ AI 자동화 유튜브 채널 탭 생성 (기본값 표시)
    const aiYouTubeTab = document.createElement("div");
    aiYouTubeTab.className = "flick_bx";  
    aiYouTubeTab.role = "presentation";
    aiYouTubeTab.id = "aiAutomationYouTubeTab";

    aiYouTubeTab.innerHTML = `
        <a role="tab" href="${youtubeLink}" 
           onclick="return goOtherCR(this,'a=tab*Y.jmp&r=0&i=&u='+urlencode(this.href));" 
           class="tab" aria-selected="false" id="youtube-main-link">
            <i class="spnew2 ico_nav_youtube"></i><span id="youtube-tab-text">${youtubeTabText}</span>
        </a>
    `;

    console.log("🛠 [AI 유튜브 탭] 기본값으로 탭 생성 완료!");

    // ✅ 유튜브 아이콘 스타일 적용
    const style = document.createElement("style");
    style.innerHTML = `
        .ico_nav_youtube {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url('https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png') no-repeat center;
            background-size: contain;
            margin-right: 6px;
        }
    `;
    document.head.appendChild(style);
    console.log("🎨 [AI 유튜브 탭] 스타일 적용 완료!");

    // ✅ 네이버 검색 탭의 맨 앞에 추가
    tabContainer.prepend(aiYouTubeTab);
    console.log("🎉 [AI 유튜브 탭] 성공적으로 추가되었습니다!");

    // ✅ Google Apps Script 데이터를 비동기적으로 가져와 업데이트
    try {
        const [tabTextRes, linkRes] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbxuIs47-q_9ggiXmCUGO_7Ay2KL1Mvk5vw-N3h9-257582uWSAe-yR7ahLG5ai7O8ehnQ/exec").then(res => res.ok ? res.text() : youtubeTabText),
            fetch("https://script.google.com/macros/s/AKfycbwNL8JjCcTh0iL4A8cgMJuaBUi3N6YXl5USaQxL8y1X0gquAAhKrcSylpUEjjv_6E6wjQ/exec").then(res => res.ok ? res.text() : youtubeLink)
        ]);

        // ✅ 요소 업데이트
        document.querySelector("#youtube-tab-text").innerText = tabTextRes;
        document.querySelector("#youtube-main-link").href = linkRes;

        console.log("🔄 [AI 유튜브 탭] Google Apps Script 데이터로 업데이트 완료!");
    } catch (error) {
        console.warn("🚨 [AI 유튜브 탭] Google Apps Script에서 데이터를 가져오는 데 실패했습니다.");
    }
}

// ✅ 네이버 검색이면 실행
if (window.location.href.includes("search.naver.com/search.naver")) {
    console.log("🌐 [AI 유튜브 탭] 네이버 검색 페이지 감지됨, 탭 추가 실행...");
    addAIAutomationYouTubeTab();
} else {
    console.log("❌ [AI 유튜브 탭] 네이버 검색 페이지가 아닙니다.");
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ✅ 네이버 메인 페이지 우측에 "AI 자동화 유튜브" 메뉴 추가
async function addAiAutomationBox() {
    console.log("🔍 [AI 자동화 박스] 네이버 우측 영역 추가 시도...");

    const observer = new MutationObserver((mutations, obs) => {
        const aiRightPanel = document.querySelector(".Layout-module__column_right___wLgQj");
        const aiWeatherSection = document.querySelector(".Layout-module__content_area___b_3TU[aria-label='날씨']");
        const aiLoginSection = document.querySelector(".Layout-module__content_area___b_3TU[role='region'][aria-label='로그인 정보']");

        if (aiRightPanel && aiWeatherSection && aiLoginSection) {
            console.log("✅ [AI 자동화 박스] 우측 영역, 로그인, 날씨 섹션 발견!");
            obs.disconnect(); // ✅ 감지 중지

            // ✅ 중복 추가 방지
            if (document.getElementById("aiAutomationBox")) {
                console.warn("⚠️ [AI 자동화 박스] 이미 추가되어 있습니다.");
                return;
            }

            // ✅ 기본값 설정
            let aiDefaultTitle = "📺 AI 자동화 복붙코딩";
            let aiDefaultChannelText = "유튜브 채널";
            let aiDefaultYoutubeTitle = "AI 자동화 유튜브 채널";
            let aiDefaultYoutubeLink = "https://www.youtube.com/@ai자동화";
            let aiDefaultDescription = "복붙코딩 & 자동화 정보 제공";

            // ✅ AI 자동화 박스 생성
            const aiMenuBox = document.createElement("section");
            aiMenuBox.className = "sc_new sp_related dt_banner";
            aiMenuBox.id = "aiAutomationBox";

            aiMenuBox.innerHTML = `
                <style>
                    #aiAutomationBox {
                        background: #ffffff;
                        border: 1px solid #e3e5e8;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 14px 0;
                        font-size: 14px;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                        width: auto;
                    }
                    .ai_title_wrap {
                        font-size: 16px;
                        font-weight: bold;
                        color: #191919;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .ai_common_banner a {
                        display: flex;
                        align-items: center;
                        text-decoration: none;
                        color: #191919;
                        font-weight: bold;
                        padding: 12px 10px;
                        border-bottom: 1px solid #f1f3f5;
                        transition: background 0.2s ease-in-out;
                    }
                    .ai_common_banner a:hover {
                        background: #f8f9fa;
                    }
                    .ai_common_banner a:last-child {
                        border-bottom: none;
                    }
                    .ai_desc {
                        font-size: 13px;
                        color: #555;
                        margin-top: 2px;
                    }
                    .ai_label {
                        background: #03c75a;
                        color: white;
                        font-size: 12px;
                        padding: 3px 6px;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                </style>

                <div class="ai_subject_bx">
                    <div class="ai_mod_title_area">
                        <div class="ai_title_wrap">
                            ${aiDefaultTitle} 
                            <span class="ai_label">${aiDefaultChannelText}</span>
                        </div>
                    </div>
                    <div class="ai_common_banner">
                        <a target="_blank" title="${aiDefaultYoutubeTitle}" href="${aiDefaultYoutubeLink}" id="aiYoutubeLink">
                            <div>
                                <strong class="ai_tit" id="aiYoutubeTitle">${aiDefaultYoutubeTitle}</strong>
                                <p class="ai_desc" id="aiDescription">${aiDefaultDescription}</p>
                            </div>
                        </a>
                        <a target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                            <div>
                                <strong class="ai_tit">ChatGPT & 넷플릭스 할인 🎬</strong>
                                <p class="ai_desc">AI 도구 & 프리미엄 서비스 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                            <div>
                                <strong class="ai_tit">쿠팡 특가 상품 🎁</strong>
                                <p class="ai_desc">최저가 할인 정보</p>
                            </div>
                        </a>
                        <a target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                            <div>
                                <strong class="ai_tit">알리익스프레스 쇼핑 🛒</strong>
                                <p class="ai_desc">해외 직구 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                            <div>
                                <strong class="ai_tit">아고다 항공 숙박 할인 ✈️</strong>
                                <p class="ai_desc">예약 무료 취소 가능</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // ✅ "로그인"과 "날씨" 사이에 추가
            aiMenuBox.style.marginTop = "12px";
            aiLoginSection.parentNode.insertBefore(aiMenuBox, aiWeatherSection);
            console.log("🎉 [AI 자동화 박스] 로그인과 날씨 사이에 성공적으로 추가되었습니다!");

            // ✅ Google Apps Script 데이터 업데이트 실행
            updateAiAutomationBox();
        }
    });

    // ✅ DOM 변화 감지 시작
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// ✅ Google Apps Script 데이터 업데이트
async function updateAiAutomationBox() {
    try {
        console.log("🔄 [AI 자동화 박스] Google Apps Script 데이터 업데이트 중...");

        // ✅ Google Apps Script에서 데이터 가져오기
        const [aiTitleRes, aiChannelRes, aiYoutubeTitleRes, aiYoutubeLinkRes, aiDescriptionRes] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec").then(res => res.ok ? res.text() : "📺 AI 자동화 유튜브"),
            fetch("https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec").then(res => res.ok ? res.text() : "유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec").then(res => res.ok ? res.text() : "AI 자동화 유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec").then(res => res.ok ? res.text() : "https://www.youtube.com/@ai자동화"),
            fetch("https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec").then(res => res.ok ? res.text() : "복붙코딩 & 자동화 정보 제공")
        ]);

        console.log("✅ [AI 자동화 박스] 데이터 불러오기 성공:", {
            aiTitleRes, aiChannelRes, aiYoutubeTitleRes, aiYoutubeLinkRes, aiDescriptionRes
        });

        // ✅ 가져온 데이터를 화면에 반영
        const aiAutomationBox = document.getElementById("aiAutomationBox");
        if (aiAutomationBox) {
            aiAutomationBox.querySelector(".ai_title_wrap").innerHTML = `${aiTitleRes} <span class="ai_label">${aiChannelRes}</span>`;
            aiAutomationBox.querySelector("#aiYoutubeTitle").innerText = aiYoutubeTitleRes;
            aiAutomationBox.querySelector("#aiYoutubeLink").href = aiYoutubeLinkRes;
            aiAutomationBox.querySelector("#aiDescription").innerText = aiDescriptionRes;

            console.log("🎉 [AI 자동화 박스] 화면 업데이트 완료!");
        } else {
            console.warn("🚨 [AI 자동화 박스] 박스를 찾을 수 없음.");
        }
    } catch (error) {
        console.error("🚨 [AI 자동화 박스] 데이터 로딩 실패:", error);
    }
}


// ✅ 실행
if (window.location.href.includes("www.naver.com")) {
    addAiAutomationBox();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 네이버 모바일 페이지의 날씨 영역 아래 "AI 자동화 유튜브" 메뉴 추가
async function addAiAutomationBoxMobile() {
    console.log("🔍 [AI 자동화 박스] 네이버 모바일 페이지 추가 시도...");

    const observer = new MutationObserver((mutations, obs) => {
        const weatherSection = document.querySelector(".comp_home_quicklink.comp_weather.comp_card");

        if (weatherSection) {
            console.log("✅ [AI 자동화 박스] 날씨 섹션 발견!");
            obs.disconnect(); // ✅ 감지 중지

            // ✅ 중복 추가 방지
            if (document.getElementById("aiAutomationBoxMobile")) {
                console.warn("⚠️ [AI 자동화 박스] 이미 추가되어 있습니다.");
                return;
            }

            // ✅ 기본값 설정
            let aiMobileTitle = "📺 AI 자동화 복붙코딩";
            let aiMobileChannelText = "유튜브 채널";
            let aiMobileYoutubeTitle = "AI 자동화 유튜브 채널";
            let aiMobileYoutubeLink = "https://www.youtube.com/@ai자동화";
            let aiMobileDescription = "복붙코딩 & 자동화 정보 제공";

            // ✅ AI 자동화 박스 생성
            const aiMobileMenuBox = document.createElement("section");
            aiMobileMenuBox.className = "ai_automation_mobile";
            aiMobileMenuBox.id = "aiAutomationBoxMobile";

            aiMobileMenuBox.innerHTML = `
                <style>
                    #aiAutomationBoxMobile {
                        background: #ffffff;
                        border: 1px solid #e3e5e8;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 14px auto;
                        font-size: 14px;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                        max-width: 90%;
                    }
                    .ai_title_wrap {
                        font-size: 16px;
                        font-weight: bold;
                        color: #191919;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .ai_common_banner a {
                        display: flex;
                        align-items: center;
                        text-decoration: none;
                        color: #191919;
                        font-weight: bold;
                        padding: 12px 10px;
                        border-bottom: 1px solid #f1f3f5;
                        transition: background 0.2s ease-in-out;
                    }
                    .ai_common_banner a:hover {
                        background: #f8f9fa;
                    }
                    .ai_common_banner a:last-child {
                        border-bottom: none;
                    }
                    .ai_desc {
                        font-size: 13px;
                        color: #555;
                        margin-top: 2px;
                    }
                    .ai_label {
                        background: #03c75a;
                        color: white;
                        font-size: 12px;
                        padding: 3px 6px;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                </style>

                <div class="ai_subject_bx">
                    <div class="ai_mod_title_area">
                        <div class="ai_title_wrap">
                            ${aiMobileTitle} 
                            <span class="ai_label">${aiMobileChannelText}</span>
                        </div>
                    </div>
                    <div class="ai_common_banner">
                        <a target="_blank" title="${aiMobileYoutubeTitle}" href="${aiMobileYoutubeLink}" id="aiYoutubeLinkMobile">
                            <div>
                                <strong class="ai_tit" id="aiYoutubeTitleMobile">${aiMobileYoutubeTitle}</strong>
                                <p class="ai_desc" id="aiDescriptionMobile">${aiMobileDescription}</p>
                            </div>
                        </a>
                        <a target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                            <div>
                                <strong class="ai_tit">ChatGPT & 넷플릭스 할인 🎬</strong>
                                <p class="ai_desc">AI 도구 & 프리미엄 서비스 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                            <div>
                                <strong class="ai_tit">쿠팡 특가 상품 🎁</strong>
                                <p class="ai_desc">최저가 할인 정보</p>
                            </div>
                        </a>
                        <a target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                            <div>
                                <strong class="ai_tit">알리익스프레스 쇼핑 🛒</strong>
                                <p class="ai_desc">해외 직구 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                            <div>
                                <strong class="ai_tit">아고다 항공 숙박 할인 ✈️</strong>
                                <p class="ai_desc">예약 무료 취소 가능</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // ✅ 날씨 섹션 아래 추가
            weatherSection.insertAdjacentElement("afterend", aiMobileMenuBox);
            console.log("🎉 [AI 자동화 박스] 날씨 아래에 성공적으로 추가되었습니다!");

            // ✅ Google Apps Script 데이터 업데이트 실행
            updateAiAutomationBoxMobile();
        }
    });

    // ✅ DOM 변화 감지 시작
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// ✅ Google Apps Script 데이터 업데이트
async function updateAiAutomationBoxMobile() {
    try {
        console.log("🔄 [AI 자동화 박스] Google Apps Script 데이터 업데이트 중...");

        const [aiMobileTitleRes, aiMobileChannelRes, aiMobileYoutubeTitleRes, aiMobileYoutubeLinkRes, aiMobileDescriptionRes] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec").then(res => res.ok ? res.text() : "📺 AI 자동화 유튜브"),
            fetch("https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec").then(res => res.ok ? res.text() : "유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec").then(res => res.ok ? res.text() : "AI 자동화 유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec").then(res => res.ok ? res.text() : "https://www.youtube.com/@ai자동화"),
            fetch("https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec").then(res => res.ok ? res.text() : "복붙코딩 & 자동화 정보 제공")
        ]);

        document.querySelector("#aiAutomationBoxMobile .ai_title_wrap").innerHTML = `${aiMobileTitleRes} <span class="ai_label">${aiMobileChannelRes}</span>`;
        document.querySelector("#aiYoutubeTitleMobile").innerText = aiMobileYoutubeTitleRes;
        document.querySelector("#aiYoutubeLinkMobile").href = aiMobileYoutubeLinkRes;
        document.querySelector("#aiDescriptionMobile").innerText = aiMobileDescriptionRes;

        console.log("🎉 [AI 자동화 박스] 화면 업데이트 완료!");
    } catch (error) {
        console.error("🚨 [AI 자동화 박스] 데이터 로딩 실패:", error);
    }
}

// ✅ 실행
if (window.location.href.includes("m.naver.com")) {
    addAiAutomationBoxMobile();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 네이버 모바일 검색 페이지 연관 검색어 아래 "AI 자동화 박스" 추가
async function insertAiAutomationBoxUnderRelatedKeywords() {
    console.log("🔍 [AI 자동화 박스] 연관 검색어 아래 추가 시도...");

    const observer = new MutationObserver((mutations, obs) => {
        const relatedKeywords = document.querySelector("#_related_keywords");

        if (relatedKeywords) {
            console.log("✅ [AI 자동화 박스] 연관 검색어 영역 발견!");
            obs.disconnect(); // ✅ 감지 중지

            // ✅ 중복 추가 방지
            if (document.getElementById("aiAutomationBoxMobile")) {
                console.warn("⚠️ [AI 자동화 박스] 이미 추가되어 있습니다.");
                return;
            }

            // ✅ 기본값 설정 (초기 표시)
            let aiMobileTitle = "📺 AI 자동화 복붙코딩";
            let aiMobileChannelText = "유튜브 채널";
            let aiMobileYoutubeTitle = "AI 자동화 유튜브 채널";
            let aiMobileYoutubeLink = "https://www.youtube.com/@ai자동화";
            let aiMobileDescription = "복붙코딩 & 자동화 정보 제공";

            // ✅ AI 자동화 박스 생성
            const aiMenuBox = document.createElement("section");
            aiMenuBox.className = "sc_new sp_related dt_banner";
            aiMenuBox.id = "aiAutomationBoxMobile";

            aiMenuBox.innerHTML = `
                <style>
                    #aiAutomationBoxMobile {
                        background: #ffffff;
                        border: 1px solid #e3e5e8;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 14px 0;
                        font-size: 14px;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                        width: auto;
                    }
                    .ai_title_wrap {
                        font-size: 16px;
                        font-weight: bold;
                        color: #191919;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .ai_common_banner a {
                        display: flex;
                        align-items: center;
                        text-decoration: none;
                        color: #191919;
                        font-weight: bold;
                        padding: 12px 10px;
                        border-bottom: 1px solid #f1f3f5;
                        transition: background 0.2s ease-in-out;
                    }
                    .ai_common_banner a:hover {
                        background: #f8f9fa;
                    }
                    .ai_common_banner a:last-child {
                        border-bottom: none;
                    }
                    .ai_desc {
                        font-size: 13px;
                        color: #555;
                        margin-top: 2px;
                    }
                    .ai_label {
                        background: #03c75a;
                        color: white;
                        font-size: 12px;
                        padding: 3px 6px;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                </style>

                <div class="ai_subject_bx">
                    <div class="ai_mod_title_area">
                        <div class="ai_title_wrap">
                            <span id="aiMobileTitle">${aiMobileTitle}</span>
                            <span class="ai_label" id="aiMobileChannelText">${aiMobileChannelText}</span>
                        </div>
                    </div>
                    <div class="ai_common_banner">
                        <a target="_blank" title="${aiMobileYoutubeTitle}" href="${aiMobileYoutubeLink}" id="aiYoutubeLinkMobile">
                            <div>
                                <strong class="ai_tit" id="aiYoutubeTitleMobile">${aiMobileYoutubeTitle}</strong>
                                <p class="ai_desc" id="aiDescriptionMobile">${aiMobileDescription}</p>
                            </div>
                        </a>
                        <a target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                            <div>
                                <strong class="ai_tit">ChatGPT & 넷플릭스 할인 🎬</strong>
                                <p class="ai_desc">AI 도구 & 프리미엄 서비스 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                            <div>
                                <strong class="ai_tit">쿠팡 특가 상품 🎁</strong>
                                <p class="ai_desc">최저가 할인 정보</p>
                            </div>
                        </a>
                        <a target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                            <div>
                                <strong class="ai_tit">알리익스프레스 쇼핑 🛒</strong>
                                <p class="ai_desc">해외 직구 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                            <div>
                                <strong class="ai_tit">아고다 항공 숙박 할인 ✈️</strong>
                                <p class="ai_desc">예약 무료 취소 가능</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // ✅ 연관 검색어 아래에 추가
            relatedKeywords.parentNode.insertBefore(aiMenuBox, relatedKeywords.nextSibling);
            console.log("🎉 [AI 자동화 박스] 연관 검색어 아래에 성공적으로 추가되었습니다!");

            // ✅ Google Apps Script 데이터 업데이트 실행 (데이터 반영 추가됨)
            updateAiAutomationBoxRelatedKeywords();
        }
    });

    // ✅ DOM 변화 감지 시작
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// ✅ Google Apps Script 데이터 업데이트
async function updateAiAutomationBoxRelatedKeywords() {
    try {
        console.log("🔄 [AI 자동화 박스] Google Apps Script 데이터 업데이트 중...");

        // ✅ Google Apps Script에서 데이터 가져오기
        const [aiMobileTitleData, aiMobileChannelData, aiMobileYoutubeTitleData, aiMobileYoutubeLinkData, aiMobileDescriptionData] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec").then(res => res.ok ? res.text() : "📺 AI 자동화 유튜브"),
            fetch("https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec").then(res => res.ok ? res.text() : "유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec").then(res => res.ok ? res.text() : "AI 자동화 복붙코딩"),
            fetch("https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec").then(res => res.ok ? res.text() : "https://www.youtube.com/@ai자동화"),
            fetch("https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec").then(res => res.ok ? res.text() : "복붙코딩 & 자동화 정보 제공")
        ]);

        // ✅ 가져온 데이터를 반영
        document.getElementById("aiMobileTitle").innerText = aiMobileTitleData;
        document.getElementById("aiMobileChannelText").innerText = aiMobileChannelData;
        document.getElementById("aiYoutubeTitleMobile").innerText = aiMobileYoutubeTitleData;
        document.getElementById("aiYoutubeLinkMobile").href = aiMobileYoutubeLinkData;
        document.getElementById("aiDescriptionMobile").innerText = aiMobileDescriptionData;

        console.log("✅ [AI 자동화 박스] 데이터 업데이트 완료!");
    } catch (error) {
        console.error("🚨 [AI 자동화 박스] 데이터 업데이트 실패:", error);
    }
}


// ✅ 실행
if (window.location.href.includes("m.search.naver.com/search.naver")) {
    insertAiAutomationBoxUnderRelatedKeywords();
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 구글 검색 우측 영역에 "AI 자동화 복붙코딩 유튜브" 메뉴 추가
// function addAIAutomationMenuToGoogle() {
//     const targetSelector = "div#rhs"; // 우측 영역
//     const rightPanel = document.querySelector(targetSelector);
//     if (!rightPanel) return;

//     // 중복 추가 방지
//     if (document.getElementById("aiAutomationGoogleBox")) return;

//     // 새 메뉴 박스 생성
//     const menuBox = document.createElement("div");
//     menuBox.className = "g VjDLd wF4fFd g-blk";
//     menuBox.id = "aiAutomationGoogleBox";

//     // ※ 구글 구조에 맞춘 코드 + 오버라이드 스타일 추가
//     menuBox.innerHTML = `
//         <style>
//             /* 우선순위 높여 flex 레이아웃 강제 적용 */
//             #aiAutomationGoogleBox .y8Jpof.pPLc9e.kpQuGf {
//                 display: flex !important;
//                 align-items: center !important;
//                 justify-content: space-between !important;
//             }
//         </style>

//         <div class="dG2XIf Wnoohf OJXvsb">
//             <div class="nGydZ">
//                 <div class="xpdopen">
//                     <div class="ifM9O">
//                         <!-- 제목 영역 -->
//                         <div class="Hhmu2e wDYxhc NFQFxe viOShc LKPcQc">
//                             <div class="Lj180d">
//                                 <div class="SPZz6b">
//                                     <h2 class="qrShPb garHBe q8U8x aTI8gc">
//                                         <span>📺 AI 자동화 복붙코딩</span>
//                                     </h2>
//                                 </div>
//                             </div>
//                         </div>

//                         <!-- AI 자동화 유튜브 채널 (제목 바로 아래) -->
//                         <a class="M3LVze ai-item" target="_blank" title="AI 자동화 유튜브 채널" href="https://www.youtube.com/@ai자동화">
//                             <div class="y8Jpof pPLc9e kpQuGf">
//                                 <div class="nm6nmc kpQuGf">
//                                     <div class="k4DMHe">
//                                         <div class="RJn8N xXEKkb ellip tNxQIb ynAwRc">AI 자동화 유튜브 채널</div>
//                                         <div class="izHQgf cwUqwd">복붙코딩 & 자동화 정보 제공</div>
//                                     </div>
//                                 </div>
//                                 <div class="ngPLf">
//                                     <span class="xBcVEe z1asCe GNeCNe">
//                                         <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                                             <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
//                                         </svg>
//                                     </span>
//                                 </div>
//                             </div>
//                         </a>

//                         <!-- 나머지 링크 메뉴 영역 -->
//                         <div class="wDYxhc NFQFxe">

//                             <!-- 쿠팡 특가 상품 -->
//                             <a class="M3LVze ai-item" href="https://link.coupang.com/a/ceqmAJ" target="_blank">
//                                 <div class="y8Jpof pPLc9e kpQuGf">
//                                     <div class="nm6nmc kpQuGf">
//                                         <div class="k4DMHe">
//                                             <div class="RJn8N xXEKkb ellip tNxQIb ynAwRc">쿠팡 특가 상품 🎁</div>
//                                             <div class="izHQgf cwUqwd">최저가 할인 정보</div>
//                                         </div>
//                                     </div>
//                                     <div class="ngPLf">
//                                         <span class="xBcVEe z1asCe GNeCNe">
//                                             <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                                                 <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
//                                             </svg>
//                                         </span>
//                                     </div>
//                                 </div>
//                             </a>

//                             <!-- ChatGPT & 넷플릭스 할인 -->
//                             <a class="M3LVze ai-item" href="https://www.gamsgo.com/partner/QZ3J4Cva" target="_blank">
//                                 <div class="y8Jpof pPLc9e kpQuGf">
//                                     <div class="nm6nmc kpQuGf">
//                                         <div class="k4DMHe">
//                                             <div class="RJn8N xXEKkb ellip tNxQIb ynAwRc">ChatGPT & 넷플릭스 할인</div>
//                                             <div class="izHQgf cwUqwd">AI 도구 & 프리미엄 서비스 할인</div>
//                                         </div>
//                                     </div>
//                                     <div class="ngPLf">
//                                         <span class="xBcVEe z1asCe GNeCNe">
//                                             <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                                                 <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
//                                             </svg>
//                                         </span>
//                                     </div>
//                                 </div>
//                             </a>

//                             <!-- 알리익스프레스 쇼핑 -->
//                             <a class="M3LVze ai-item" target="_blank" title="알리익스프레스 쇼핑" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
//                                 <div class="y8Jpof pPLc9e kpQuGf">
//                                     <div class="nm6nmc kpQuGf">
//                                         <div class="k4DMHe">
//                                             <div class="RJn8N xXEKkb ellip tNxQIb ynAwRc">알리익스프레스 쇼핑</div>
//                                             <div class="izHQgf cwUqwd">해외 직구 할인</div>
//                                         </div>
//                                     </div>
//                                     <div class="ngPLf">
//                                         <span class="xBcVEe z1asCe GNeCNe">
//                                             <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                                                 <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
//                                             </svg>
//                                         </span>
//                                     </div>
//                                 </div>
//                             </a>

//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;

//     // ✅ 우측 패널 맨 위에 삽입
//     rightPanel.insertBefore(menuBox, rightPanel.firstChild);
//     console.log("✅ 'AI 자동화 복붙코딩' 메뉴가 구글 검색 페이지에 추가되었습니다!");
// }

// // ✅ 구글 검색이면 실행
// if (window.location.href.includes("google.com/search") || window.location.href.includes("google.co.kr/search")) {
//     addAIAutomationMenuToGoogle();
// }




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 구글 검색 상단 영역에 "AI 자동화 복붙코딩 유튜브" 메뉴 추가
// async function addAIAutomationYouTubeLink() {
//     // ✅ 구글 검색 결과 상단 영역 찾기
//     const searchResultsContainer = document.querySelector("div#search");

//     if (!searchResultsContainer) {
//         console.warn("❌ 구글 검색 결과 상단을 찾을 수 없습니다.");
//         return;
//     }

//     // ✅ 중복 추가 방지
//     if (document.getElementById("aiAutomationYouTubeBox")) return;

//     // ✅ Google Apps Script 데이터 URL
//     const YOUTUBE_HEADER_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmBEVlW6Ryh-D4S2Rb6VAMQSsO72-9tgM3hfZnywp2gt0ngEqe2L_2nPkcPCRrFKIm/exec";
//     const YOUTUBE_LINK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjkExNS02GohvLzqYE0_ANFVUYZhZdkSMHOYrulD8zZzWetGy5HPX3R9qfi8LtlkGp/exec";
//     const YOUTUBE_TEXT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb5KS2pXtfVZrzApgVtocj4ED2hbktpd08txLCmBufZILvR2MNAEF82EJcKIAaBvB2/exec";
//     const YOUTUBE_DESC_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqiHjCFWqv8khR_o0nrtNu3wjWhbgKndyaKG7BW_Gtw6GNRcFIpNMqbOu0Jo2TyfxL/exec";

//     // ✅ 기본값 (즉시 표시)
//     let youtubeHeaderText = "🚀 AI 자동화 유튜브 채널";
//     let youtubeLink = "https://www.youtube.com/@ai자동화";
//     let youtubeText = "유튜브";
//     let youtubeDescription = `
//         본 채널은 AI 자동화 도구를 활용해 누구나 쉽게 코딩을 배울 수 있도록 도와드립니다.
//         챗GPT와 같은 AI를 활용한 코딩 기초부터 실전 프로젝트까지, 복잡한 개념도 쉽게 이해할 수 있도록 설명해 드립니다.
//         각종 블로그 자동화를 통하여 초보자도 쉽게 따라할 수 있는 "확장 프로그램"을 무료로 제공하고 있습니다.
//         지금 바로 구독하고, AI와 함께하는 쉽고 재미있는 코딩 여정을 시작하세요!
//     `;

//     // ✅ 새로운 링크 컨테이너 생성
//     const aiYouTubeBox = document.createElement("div");
//     aiYouTubeBox.className = "N54PNb BToiNc";  // ✅ 기존 구글 스타일 적용
//     aiYouTubeBox.id = "aiAutomationYouTubeBox";

//     aiYouTubeBox.innerHTML = `
//         <style>
//             /* ✅ 제목을 한 칸 아래로 내리는 스타일 */
//             #aiAutomationYouTubeBox h3 {
//                 margin-top: 60px !important;
//                 margin-bottom: 5px !important;
//                 display: block !important;
//             }
//             #aiAutomationYouTubeBox .VwiC3b {
//                 display: block !important;
//                 overflow: hidden !important;
//                 text-overflow: ellipsis !important;
//                 white-space: normal !important;
//                 line-height: 1.5 !important;
//                 font-size: 14px !important;
//                 color: #bdc1c6 !important;
//             }
//             #aiAutomationYouTubeBox .HGLrXd {
//                 display: flex !important;
//                 align-items: center !important;
//             }
//             #aiAutomationYouTubeBox img {
//                 margin-right: 8px !important;
//             }
//         </style>

//         <div class="kb0PBd A9Y9g jGGQ5e">
//             <div class="yuRUbf">
//                 <div>
//                     <span jscontroller="msmzHf" jsaction="rcuQ6b:npT2md;PYDNKe:bLV6Bd;mLt3mc">
//                         <a jsname="UWckNb" href="${youtubeLink}" target="_blank" id="youtube-main-link">
//                             <div class="notranslate HGLrXd NJjxre iUh30 ojE3Fb">
//                                 <div class="q0vns">
//                                     <span class="DDKf1c">
//                                         <div class="eqA2re UnOTSe Vwoesf" aria-hidden="true">
//                                             <img class="XNo5Ab" src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" style="height:26px;width:26px" alt="유튜브 아이콘">
//                                         </div>
//                                     </span>
//                                     <div class="CA5RN">
//                                         <div><span class="VuuXrf" id="youtube-text">${youtubeText}</span></div>
//                                         <div class="byrV5b">
//                                             <cite class="qLRx3b tjvcx GvPZzd cHaqb" id="youtube-main-cite">${youtubeLink}</cite>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <h3 class="LC20lb MBeuO DKV0Md" id="youtube-header">${youtubeHeaderText}</h3>
//                         </a>
//                     </span>
//                     <!-- 설명 추가 -->
//                     <div class="kb0PBd A9Y9g" data-snf="nke7rc" data-sncf="1">
//                         <div class="VwiC3b yXK7lf p4wth r025kc hJNv6b Hdw6tb">
//                             <span class="LEwnzc Sqrs4e"><span>2025년 3월 08일</span> — </span>
//                             <span id="youtube-description">${youtubeDescription}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;

//     // ✅ 검색 결과 최상단에 삽입
//     searchResultsContainer.insertBefore(aiYouTubeBox, searchResultsContainer.firstChild);
//     console.log("✅ 'AI 자동화 유튜브 채널' 링크가 구글 검색 상단에 추가되었습니다!");

//     // ✅ Google Apps Script 데이터를 비동기적으로 가져와 업데이트
//     try {
//         const [headerRes, linkRes, textRes, descRes] = await Promise.all([
//             fetch(YOUTUBE_HEADER_SCRIPT_URL).then(res => res.ok ? res.text() : youtubeHeaderText),
//             fetch(YOUTUBE_LINK_SCRIPT_URL).then(res => res.ok ? res.text() : youtubeLink),
//             fetch(YOUTUBE_TEXT_SCRIPT_URL).then(res => res.ok ? res.text() : youtubeText),
//             fetch(YOUTUBE_DESC_SCRIPT_URL).then(res => res.ok ? res.text() : youtubeDescription)
//         ]);

//         // ✅ 요소 업데이트
//         document.querySelector("#youtube-header").innerText = headerRes;
//         document.querySelector("#youtube-main-link").href = linkRes;
//         document.querySelector("#youtube-main-cite").innerText = linkRes;
//         document.querySelector("#youtube-text").innerText = textRes;
//         document.querySelector("#youtube-description").innerText = descRes;
//     } catch (error) {
//         console.warn("🚨 Google Apps Script에서 데이터를 가져오는 데 실패했습니다.");
//     }
// }

// // ✅ 구글 검색이면 실행
// if (window.location.href.includes("google.com/search") || window.location.href.includes("google.co.kr/search")) {
//     addAIAutomationYouTubeLink();
// }



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 구글 모바일 검색 페이지 최상단에 "AI 자동화 박스" 추가
async function insertAiAutomationBoxTopGoogle() {
    console.log("🔍 [AI 자동화 박스] 구글 검색 최상단 추가 시도...");

    const observer = new MutationObserver((mutations, obs) => {
        const searchTopContainer = document.querySelector(
            'div.uEierd, div.y0NFKc, div.MjjYud, div.o3j99.qarstb, div.JwzvB'
        );

        if (searchTopContainer && !document.getElementById("aiAutomationBoxGoogle")) {
            console.log("✅ [AI 자동화 박스] 구글 모바일 검색 최상단 영역 발견!");

            // ✅ 중복 추가 방지 및 감지 중지
            obs.disconnect();

            // ✅ 기본값 설정 (초기 표시)
            let aiGoogleTitle = "📺 AI 자동화 복붙코딩";
            let aiGoogleChannelText = "유튜브 채널";
            let aiGoogleYoutubeTitle = "AI 자동화 유튜브 채널";
            let aiGoogleYoutubeLink = "https://www.youtube.com/@ai자동화";
            let aiGoogleDescription = "복붙코딩 & 자동화 정보 제공";

            // ✅ AI 자동화 박스 생성
            const aiMenuBox = document.createElement("section");
            aiMenuBox.className = "sc_new sp_related dt_banner";
            aiMenuBox.id = "aiAutomationBoxGoogle";

            aiMenuBox.innerHTML = `
                <style>
                    #aiAutomationBoxGoogle {
                        background: #ffffff;
                        border: 1px solid #e3e5e8;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 14px 0;
                        font-size: 14px;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                        width: auto;
                    }
                    .ai_title_wrap {
                        font-size: 16px;
                        font-weight: bold;
                        color: #191919;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .ai_common_banner a {
                        display: flex;
                        align-items: center;
                        text-decoration: none;
                        color: #191919;
                        font-weight: bold;
                        padding: 12px 10px;
                        border-bottom: 1px solid #f1f3f5;
                        transition: background 0.2s ease-in-out;
                    }
                    .ai_common_banner a:hover {
                        background: #f8f9fa;
                    }
                    .ai_common_banner a:last-child {
                        border-bottom: none;
                    }
                    .ai_desc {
                        font-size: 13px;
                        color: #555;
                        margin-top: 2px;
                    }
                    .ai_label {
                        background: #03c75a;
                        color: white;
                        font-size: 12px;
                        padding: 3px 6px;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                </style>

                <div class="ai_subject_bx">
                    <div class="ai_mod_title_area">
                        <div class="ai_title_wrap">
                            <span id="aiGoogleTitle">${aiGoogleTitle}</span>
                            <span class="ai_label" id="aiGoogleChannelText">${aiGoogleChannelText}</span>
                        </div>
                    </div>
                    <div class="ai_common_banner">
                        <a target="_blank" title="${aiGoogleYoutubeTitle}" href="${aiGoogleYoutubeLink}" id="aiYoutubeLinkGoogle">
                            <div>
                                <strong class="ai_tit" id="aiYoutubeTitleGoogle">${aiGoogleYoutubeTitle}</strong>
                                <p class="ai_desc" id="aiDescriptionGoogle">${aiGoogleDescription}</p>
                            </div>
                        </a>
                        <a target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                            <div>
                                <strong class="ai_tit">ChatGPT & 넷플릭스 할인 🎬</strong>
                                <p class="ai_desc">AI 도구 & 프리미엄 서비스 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                            <div>
                                <strong class="ai_tit">쿠팡 특가 상품 🎁</strong>
                                <p class="ai_desc">최저가 할인 정보</p>
                            </div>
                        </a>
                        <a target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                            <div>
                                <strong class="ai_tit">알리익스프레스 쇼핑 🛒</strong>
                                <p class="ai_desc">해외 직구 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                            <div>
                                <strong class="ai_tit">아고다 항공 숙박 할인 ✈️</strong>
                                <p class="ai_desc">예약 무료 취소 가능</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // ✅ 검색 최상단에 추가
            searchTopContainer.insertBefore(aiMenuBox, searchTopContainer.firstChild);
            console.log("🎉 [AI 자동화 박스] 구글 모바일 검색 최상단에 성공적으로 추가되었습니다!");

            // ✅ Google Apps Script 데이터 업데이트 실행 (데이터 반영 추가됨)
            updateAiAutomationBoxGoogle();
        }
    });

    // ✅ DOM 변화 감지 시작
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// ✅ Google Apps Script 데이터 업데이트
async function updateAiAutomationBoxGoogle() {
    try {
        console.log("🔄 [AI 자동화 박스] 구글 모바일 Google Apps Script 데이터 업데이트 중...");

        // ✅ Google Apps Script에서 데이터 가져오기
        const [aiGoogleTitleData, aiGoogleChannelData, aiGoogleYoutubeTitleData, aiGoogleYoutubeLinkData, aiGoogleDescriptionData] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec").then(res => res.ok ? res.text() : "📺 AI 자동화 유튜브"),
            fetch("https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec").then(res => res.ok ? res.text() : "유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec").then(res => res.ok ? res.text() : "AI 자동화 복붙코딩"),
            fetch("https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec").then(res => res.ok ? res.text() : "https://www.youtube.com/@ai자동화"),
            fetch("https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec").then(res => res.ok ? res.text() : "복붙코딩 & 자동화 정보 제공")
        ]);

        // ✅ 가져온 데이터를 반영
        document.getElementById("aiGoogleTitle").innerText = aiGoogleTitleData;
        document.getElementById("aiGoogleChannelText").innerText = aiGoogleChannelData;
        document.getElementById("aiYoutubeTitleGoogle").innerText = aiGoogleYoutubeTitleData;
        document.getElementById("aiYoutubeLinkGoogle").href = aiGoogleYoutubeLinkData;
        document.getElementById("aiDescriptionGoogle").innerText = aiGoogleDescriptionData;

        console.log("✅ [AI 자동화 박스] 구글 모바일 데이터 업데이트 완료!");
    } catch (error) {
        console.error("🚨 [AI 자동화 박스] 구글 모바일 데이터 업데이트 실패:", error);
    }
}

// ✅ 실행
if (window.location.href.includes("google.co.kr") || window.location.href.includes("google.com")) {
    insertAiAutomationBoxTopGoogle();
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ✅ 유튜브 사이드바에 "AI 자동화 박스" 추가
async function insertAiAutomationBoxYouTubeSidebar() {
    console.log("🔍 [AI 자동화 박스] 유튜브 사이드바 추가 시도...");

    const observer = new MutationObserver((mutations, obs) => {
        const youTubeSidebar = document.querySelector(
            'ytd-guide-section-renderer, ytm-mobile-topbar-renderer'
        );
        
        if (youTubeSidebar && !document.getElementById("aiAutomationBoxYouTubeSidebar")) {
            console.log("✅ [AI 자동화 박스] 유튜브 사이드바 영역 발견!");

            // ✅ 중복 추가 방지 및 감지 중지
            obs.disconnect();

            // ✅ 기본값 설정 (초기 표시)
            let aiYouTubeTitle = "📺 AI 자동화 복붙코딩";
            let aiYouTubeChannelText = "유튜브 채널";
            let aiYouTubeYoutubeTitle = "AI 자동화 유튜브 채널";
            let aiYouTubeYoutubeLink = "https://www.youtube.com/@ai자동화";
            let aiYouTubeDescription = "복붙코딩 & 자동화 정보 제공";

            // ✅ AI 자동화 박스 생성
            const aiMenuBox = document.createElement("section");
            aiMenuBox.className = "sc_new sp_related dt_banner";
            aiMenuBox.id = "aiAutomationBoxYouTubeSidebar";

            aiMenuBox.innerHTML = `
                <style>
                    #aiAutomationBoxYouTubeSidebar {
                    background: #ffffff;
                    border: 1px solid #e3e5e8;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 14px 0;
                    font-size: 14px;
                    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                    width: auto;
                }
                .ai_title_wrap {
                    font-size: 16px;
                    font-weight: bold;
                    color: #191919;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    white-space: nowrap; /* ✅ 줄바꿈 방지 */
                    overflow: hidden; /* ✅ 넘치는 글자 숨김 */
                    text-overflow: ellipsis; /* ✅ 말줄임표(...) 적용 */
                    max-width: 100%; /* ✅ 부모 요소를 넘지 않도록 설정 */
                }
                .ai_common_banner a {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                    color: #191919;
                    font-weight: bold;
                    padding: 12px 10px;
                    border-bottom: 1px solid #f1f3f5;
                    transition: background 0.2s ease-in-out;
                    white-space: nowrap; /* ✅ 줄바꿈 방지 */
                    overflow: hidden; /* ✅ 넘치는 글자 숨김 */
                    text-overflow: ellipsis; /* ✅ 말줄임표(...) 적용 */
                    max-width: 100%; /* ✅ 부모 요소를 넘지 않도록 설정 */
                }
                .ai_common_banner a:hover {
                    background: #f8f9fa;
                }
                .ai_common_banner a:last-child {
                    border-bottom: none;
                }
                .ai_desc {
                    font-size: 13px;
                    color: #555;
                    margin-top: 2px;
                    white-space: nowrap; /* ✅ 줄바꿈 방지 */
                    overflow: hidden; /* ✅ 넘치는 글자 숨김 */
                    text-overflow: ellipsis; /* ✅ 말줄임표(...) 적용 */
                    max-width: 100%; /* ✅ 부모 요소를 넘지 않도록 설정 */
                }
                .ai_label {
                    background: #03c75a;
                    color: white;
                    font-size: 12px;
                    padding: 3px 6px;
                    border-radius: 12px;
                    font-weight: bold;
                    white-space: nowrap; /* ✅ 줄바꿈 방지 */
                    overflow: hidden; /* ✅ 넘치는 글자 숨김 */
                    text-overflow: ellipsis; /* ✅ 말줄임표(...) 적용 */
                    max-width: 100%; /* ✅ 부모 요소를 넘지 않도록 설정 */
                }
                </style>

                <div class="ai_subject_bx">
                    <div class="ai_mod_title_area">
                        <div class="ai_title_wrap">
                            <span id="aiYouTubeTitle">${aiYouTubeTitle}</span>

                        </div>
                    </div>
                    <div class="ai_common_banner">
                        <a target="_blank" title="${aiYouTubeYoutubeTitle}" href="${aiYouTubeYoutubeLink}" id="aiYoutubeLinkYouTube">
                            <div>
                                <strong class="ai_tit" id="aiYoutubeTitleYouTube">${aiYouTubeYoutubeTitle}</strong>
                                <p class="ai_desc" id="aiDescriptionYouTube">${aiYouTubeDescription}</p>
                            </div>
                        </a>
                        <a target="_blank" title="ChatGPT & 넷플릭스 할인 🎬" href="https://www.gamsgo.com/partner/QZ3J4Cva">
                            <div>
                                <strong class="ai_tit">챗GPT & 넷플릭스 할인🎬</strong>
                                <p class="ai_desc">AI 도구 & 프리미엄 서비스</p>
                            </div>
                        </a>
                        <a target="_blank" title="쿠팡 특가 상품 🎁" href="https://link.coupang.com/a/ceqmAJ">
                            <div>
                                <strong class="ai_tit">쿠팡 특가 상품 🎁</strong>
                                <p class="ai_desc">최저가 할인 정보</p>
                            </div>
                        </a>
                        <a target="_blank" title="알리익스프레스 쇼핑 🛒" href="https://s.click.aliexpress.com/e/_olRoB9e?bz=300*250">
                            <div>
                                <strong class="ai_tit">알리익스프레스 쇼핑 🛒</strong>
                                <p class="ai_desc">해외 직구 할인</p>
                            </div>
                        </a>
                        <a target="_blank" title="아고다 항공 숙박 할인 ✈️" href="https://newtip.net/click.php?m=agoda&a=A100694880&l=0000">
                            <div>
                                <strong class="ai_tit">아고다 항공 숙박 할인 ✈️</strong>
                                <p class="ai_desc">예약 무료 취소 가능</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // ✅ 유튜브 사이드바에 추가
            youTubeSidebar.appendChild(aiMenuBox);
            console.log("🎉 [AI 자동화 박스] 유튜브 사이드바에 성공적으로 추가되었습니다!");

            // ✅ Google Apps Script 데이터 업데이트 실행 (데이터 반영 추가됨)
            updateAiAutomationBoxYouTubeSidebar();
        }
    });

    // ✅ DOM 변화 감지 시작
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// ✅ Google Apps Script 데이터 업데이트
async function updateAiAutomationBoxYouTubeSidebar() {
    try {
        console.log("🔄 [AI 자동화 박스] 유튜브 Google Apps Script 데이터 업데이트 중...");

        // ✅ Google Apps Script에서 데이터 가져오기
        const [aiYouTubeTitleData, aiYouTubeChannelData, aiYouTubeYoutubeTitleData, aiYouTubeYoutubeLinkData, aiYouTubeDescriptionData] = await Promise.all([
            fetch("https://script.google.com/macros/s/AKfycbwQwWahG1njf6RGzGbB5gzIWnTsaPwi6e0I4Sc9R535cYdJVY2WMbwisB6za0IcPx0w/exec").then(res => res.ok ? res.text() : "📺 AI 자동화 유튜브"),
            fetch("https://script.google.com/macros/s/AKfycbzWP0T1zKjEgLaGPFJ-RLgukQyD1LRVkl1kEmvCxzZwB-ZpQxLQqZ_BLEaLzDtpE9gw/exec").then(res => res.ok ? res.text() : "유튜브 채널"),
            fetch("https://script.google.com/macros/s/AKfycbxd37sU-5o-iFgV2bwXkpCWxDN4LRRI8gDTonzgibFc7KJADIE7Oz9kOGx-3LJJL9b-/exec").then(res => res.ok ? res.text() : "AI 자동화 복붙코딩"),
            fetch("https://script.google.com/macros/s/AKfycbyKeN_VAasoDLq066LeqoxNov2uhrKc64VmU25UVIFo7Wfp0W4QjpRgqHtMBI3uz90V/exec").then(res => res.ok ? res.text() : "https://www.youtube.com/@ai자동화"),
            fetch("https://script.google.com/macros/s/AKfycbzY3Hi8XoKNYpS2LzC4EF3LCiNzzfR4fUpFU1aIUjFvV-TOjOe9qjR-yDb0uxIVjJHZ/exec").then(res => res.ok ? res.text() : "복붙코딩 & 자동화 정보 제공")
        ]);

        // ✅ 가져온 데이터를 반영
        document.getElementById("aiYouTubeTitle").innerText = aiYouTubeTitleData;
        document.getElementById("aiYouTubeChannelText").innerText = aiYouTubeChannelData;
        document.getElementById("aiYoutubeTitleYouTube").innerText = aiYouTubeYoutubeTitleData;
        document.getElementById("aiYoutubeLinkYouTube").href = aiYouTubeYoutubeLinkData;
        document.getElementById("aiDescriptionYouTube").innerText = aiYouTubeDescriptionData;

        console.log("✅ [AI 자동화 박스] 유튜브 데이터 업데이트 완료!");
    } catch (error) {
        console.error("🚨 [AI 자동화 박스] 유튜브 데이터 업데이트 실패:", error);
    }
}

// ✅ 실행
if (window.location.href.includes("youtube.com")) {
    insertAiAutomationBoxYouTubeSidebar();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
