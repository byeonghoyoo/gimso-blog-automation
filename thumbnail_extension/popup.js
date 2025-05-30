// ✅ 유튜브 [ai자동화 복붙코딩]이 제작한 것으로 임의 수정 배포하시면 안됩니다.

document.addEventListener("DOMContentLoaded", function () {
    const textInput = document.getElementById("text-input");
    const imageInput = document.getElementById("image-input");
    const naverTitleButton = document.getElementById("naver-title-button");
    const clipboardButton = document.getElementById("clipboard-image-button");
    const backgroundImageSelect = document.getElementById("background-image-select");
    const aspectRatioSelect = document.getElementById("aspect-ratio");
    const thumbnailWidthInput = document.getElementById("thumbnail-width");
    const thumbnailHeightInput = document.getElementById("thumbnail-height");
    const backgroundColorSelect = document.getElementById("background-color");
    const borderColorSelect = document.getElementById("border-color");
    const textColorSelect = document.getElementById("text-color");
    const textOutlineSelect = document.getElementById("text-outline");
//  const textShadowSelect = document.createElement("select");
//  const fontSizeInput = document.createElement("input");
    const generateButton = document.getElementById("generate-thumbnail");
    const saveButton = document.getElementById("save-thumbnail");
    const copyButton = document.getElementById("copy-thumbnail");
    const thumbnailPreview = document.getElementById("thumbnail-preview");
    const thumbnailText = document.getElementById("thumbnail-text");
    const autoFetchCheckbox = document.getElementById("auto-fetch-title");
    const fontSizeInput = document.getElementById("font-size-input"); // ✅ 기존 HTML 요소 가져오기
    const textShadowSelect = document.getElementById("text-shadow-select"); //✅ 기존 HTML 요소 가져오기
    const textColorPicker = document.getElementById("text-color-picker");
    let selectedTextRange = null; // ✅ 선택된 텍스트 범위를 저장할 변수



    // ✅ 자동 실행할 요소 목록
    const autoTriggerElements = [
        "text-input",           // 텍스트 입력
        "image-input",          // 이미지 업로드
        "background-image-select", // 배경 이미지 선택
        "aspect-ratio",         // 비율 선택
        "thumbnail-width",      // 썸네일 너비
        "thumbnail-height",     // 썸네일 높이
        "background-color",     // 배경 색상
        "border-color",         // 테두리 색상
        "text-color",           // 글씨 색상
        "text-outline",         // 글씨 테두리 색상
        "text-shadow-select",   // 글씨 그림자 효과
        "font-size-input"       // 글씨 크기
    ];

    // ✅ 각 요소에 change 이벤트 추가 → 값이 변경될 때 자동으로 썸네일 생성 실행
    autoTriggerElements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener("change", () => {
                generateButton.click(); // ✅ 변경 시 썸네일 자동 생성
            });
        }
    });

    // // ✅ 텍스트 입력 필드는 입력할 때도 반영되도록 keyup 이벤트 추가
    // if (textInput) {
    //     textInput.addEventListener("keyup", () => {
    //         generateButton.click();
    //     });
    // }

    // ✅ 텍스트 입력 시 줄 바꿈을 반영하여 출력
    if (textInput) {
        textInput.addEventListener("keyup", () => {
            let inputText = textInput.value.replace(/\n/g, "<br>"); // ✅ 줄 바꿈을 <br> 태그로 변환
            thumbnailText.innerHTML = inputText; // ✅ HTML 적용 (줄 바꿈 반영)
            generateButton.click(); // ✅ 썸네일 자동 생성
        });
    }



    // ✅ 글씨 크기 변경 시 즉시 반영
    fontSizeInput.addEventListener("change", function () {
        thumbnailText.style.fontSize = fontSizeInput.value + "px";
        generateButton.click();
    });

    // ✅ 키보드 입력 시에도 글씨 크기 변경 적용
    fontSizeInput.addEventListener("keyup", function () {
        thumbnailText.style.fontSize = fontSizeInput.value + "px";
        generateButton.click();
    });


    // ✅ 썸네일 텍스트에 그림자 효과 적용
    textShadowSelect.addEventListener("change", function () {
        const selectedShadow = textShadowSelect.value;
        if (selectedShadow === "none") {
            thumbnailText.style.textShadow = "none";
        } else if (selectedShadow === "default") {
            thumbnailText.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
        } else if (selectedShadow === "strong") {
            thumbnailText.style.textShadow = "4px 4px 8px rgba(0, 0, 0, 0.7)";
        }
        generateButton.click(); // ✅ 옵션 변경 시 썸네일 업데이트
    });


    // ✅ 썸네일 안의 텍스트에서만 선택 이벤트 실행
    thumbnailText.addEventListener("mouseup", function () {
        let selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.anchorNode.parentElement === thumbnailText) {
            selectedTextRange = selection.getRangeAt(0);
            if (!selection.isCollapsed) { // ✅ 텍스트가 선택된 경우만 실행
                textColorPicker.click(); // ✅ 색상 선택기 열기
            }
        }
    });

    // ✅ 썸네일 색상 선택 시, 선택한 텍스트의 색상 변경
    textColorPicker.addEventListener("input", function () {
        if (selectedTextRange) {
            let span = document.createElement("span");
            span.style.color = textColorPicker.value; // ✅ 선택한 색상 적용
            span.appendChild(selectedTextRange.extractContents()); // ✅ 선택된 텍스트 유지
            selectedTextRange.insertNode(span);
        }
    });


    // ✅ 저장된 배경 이미지 값을 불러오기
    chrome.storage.sync.get("selectedBackgroundImage", (data) => {
        if (data.selectedBackgroundImage) {
            backgroundImageSelect.value = data.selectedBackgroundImage;
            applyBackgroundImage(data.selectedBackgroundImage);
        }
    });

    // ✅ 배경 이미지 선택 시 변경된 값 저장
    backgroundImageSelect.addEventListener("change", () => {
        const selectedImage = backgroundImageSelect.value;
        chrome.storage.sync.set({ selectedBackgroundImage: selectedImage });

        applyBackgroundImage(selectedImage);
    });

    // ✅ 배경 이미지를 적용하는 함수
    function applyBackgroundImage(image) {
        if (image === "none") {
            thumbnailPreview.style.backgroundImage = "none";
        } else {
            thumbnailPreview.style.backgroundImage = `url(${image})`;
            thumbnailPreview.style.backgroundSize = "cover";
            thumbnailPreview.style.backgroundPosition = "center";
        }
    }




    // ✅ 저장된 설정 불러오기
    chrome.storage.sync.get("autoFetchTitle", (data) => {
        autoFetchCheckbox.checked = data.autoFetchTitle || false; // 기본값: false

        // ✅ 체크 상태면 자동으로 제목 가져오기 실행
        if (autoFetchCheckbox.checked) {
            setTimeout(() => {
                naverTitleButton.click();
            }, 500); // 0.5초 후 실행
        }
    });

    // ✅ 체크박스 상태 변경 시 설정 저장
    autoFetchCheckbox.addEventListener("change", function () {
        chrome.storage.sync.set({ autoFetchTitle: autoFetchCheckbox.checked });
    });



    // ✅ 프로그램 실행 후 1초 뒤에 자동으로 '썸네일 생성' 실행
    // setTimeout(() => {
    //     generateButton.click();
    //     console.log("✅ 썸네일 자동 생성 실행됨");
    // }, 1000); // 1000ms (1초)





    // ✅ html2canvas 로드 확인
    if (typeof html2canvas === "undefined") {
        console.error("❌ html2canvas가 로드되지 않았습니다.");
        alert("❌ html2canvas 로드 실패! 확장 프로그램을 다시 설치해 주세요.");
        return;
    }

    // ✅ 배경 이미지 선택 시 즉시 적용
    backgroundImageSelect.addEventListener("change", () => {
        const selectedImage = backgroundImageSelect.value;
        if (selectedImage === "none") {
            thumbnailPreview.style.backgroundImage = "none";
        } else {
            thumbnailPreview.style.backgroundImage = `url(${selectedImage})`;
            thumbnailPreview.style.backgroundSize = "cover";
            thumbnailPreview.style.backgroundPosition = "center";
        }
    });

    // ✅ 사이트 제목 가져오기
    naverTitleButton.addEventListener("click", async (event) => {
        event.preventDefault(); // 기본 동작 방지
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id, allFrames: true }, // 모든 프레임에서 실행
                    function: () => {
                        try {
                            let title = null;

                            // ✅ 티스토리 제목 가져오기
                            const tistoryXPath = document.evaluate(
                                "/html/body/div[1]/div/main/div/div[2]/textarea",
                                document,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null
                            );
                            if (tistoryXPath.singleNodeValue) {
                                title = tistoryXPath.singleNodeValue.textContent.trim();
                            }

                            // ✅ 구글 블로그 제목 가져오기 (input 태그)
                            if (!title) {
                                const googleBlogTitle = document.querySelector('input.whsOnd.zHQkBf[jsname="YPqjbf"]');
                                if (googleBlogTitle) {
                                    title = googleBlogTitle.value.trim();
                                }
                            }

                            // ✅ 네이버 블로그 제목 가져오기 (span 태그 또는 iframe 내부)
                            if (!title) {
                                const naverBlogTitle = document.querySelector('span.se-ff-nanummaruburi.se-fs32.__se-node');
                                if (naverBlogTitle) {
                                    title = naverBlogTitle.textContent.trim();
                                } else {
                                    // iframe 내부에서 제목 찾기
                                    const iframe = document.querySelector('iframe');
                                    if (iframe && iframe.contentDocument) {
                                        const iframeTitle = iframe.contentDocument.querySelector('span.se-ff-nanummaruburi.se-fs32.__se-node');
                                        if (iframeTitle) {
                                            title = iframeTitle.textContent.trim();
                                        }
                                    }
                                }
                            }

                            // ✅ XPath에서 찾지 못하면 <title> 태그에서 가져오기
                            if (!title) {
                                title = document.title;
                            }

                            if (title) {
                                console.log("✅ 제목 가져오기 성공:", title);
                                return title;
                            } else {
                                console.error("❌ 제목을 찾을 수 없음");
                                return null;
                            }
                        } catch (error) {
                            console.error("❌ 제목 가져오기 오류:", error);
                            return null;
                        }
                    }
                },
                (result) => {
                    if (result && result[0] && result[0].result) {
                        textInput.value = result[0].result;
                        textInput.style.display = "block"; // 요소가 보이도록 설정
                        console.log("✅ 제목 가져오기 성공:", result[0].result);
                    } else {
                        alert("❌ 제목을 가져올 수 없습니다!");
                    }
                }
            );
        } catch (error) {
            console.error("❌ 제목 가져오기 오류:", error);
        }
    });

    // ✅ 글씨 그림자 옵션 추가
    // textShadowSelect.id = "text-shadow-select";
    // textShadowSelect.innerHTML = `
    //     <option value="none">없음</option>
    //     <option value="default">기본 (2px 2px 4px)</option>
    //     <option value="strong" selected>강한 그림자 (4px 4px 8px)</option>
    // `;

    // const textShadowLabel = document.createElement("label");
    // textShadowLabel.innerText = "[글씨 그림자 효과]";
    // textShadowLabel.classList.add("styled-label2"); // ✅ 스타일 적용
    // textShadowLabel.appendChild(textShadowSelect);
    // document.getElementById("thumbnail-form").appendChild(textShadowLabel);

    // ✅ 글씨 크기 조절 메뉴 추가
    // fontSizeInput.type = "number";
    // fontSizeInput.id = "font-size-input";
    // fontSizeInput.value = 70;
    // fontSizeInput.max = 200;
    // fontSizeInput.min = 20;
    // fontSizeInput.style.width = "100%";
    // fontSizeInput.style.margin = "10px 0";

    // const fontSizeLabel = document.createElement("label");
    // const fontSizeText = document.createElement("span"); // ✅ 텍스트 전용 span 생성
    // fontSizeText.innerText = "글씨 크기 (px)";
    // fontSizeText.classList.add("styled-label2"); // ✅ 글씨만 스타일 적용
    // fontSizeText.style.width = "150px"; // ✅ 가로 크기 조절 (필요 시 변경 가능)

    
    // fontSizeLabel.appendChild(fontSizeText); // ✅ span을 label 안에 추가
    // fontSizeLabel.appendChild(fontSizeInput);
    // document.getElementById("thumbnail-form").appendChild(fontSizeLabel);

    // ✅ 비율 선택 시 크기 자동 변경
    aspectRatioSelect.addEventListener("change", () => {
        const selectedRatio = aspectRatioSelect.value;
        if (selectedRatio === "1:1") {
            thumbnailWidthInput.value = 400;
            thumbnailHeightInput.value = 400;
        } else if (selectedRatio === "3:2") {
            thumbnailWidthInput.value = 600;
            thumbnailHeightInput.value = 400;
        } else if (selectedRatio === "16:9") {
            thumbnailWidthInput.value = 800;
            thumbnailHeightInput.value = 450;
        }
    
        generateButton.click(); // ✅ 비율 변경 후 썸네일 자동 생성 실행
    });
    

    // ✅ 썸네일 생성
    generateButton.addEventListener("click", () => {
        const width = parseInt(thumbnailWidthInput.value, 10);
        const height = parseInt(thumbnailHeightInput.value, 10);
        const backgroundColor = backgroundColorSelect.value;
        const borderColor = borderColorSelect.value;
        const text = textInput.value;
        const textColor = textColorSelect.value;
        const textOutlineColor = textOutlineSelect.value;
        const textShadow = textShadowSelect.value;
        const fontSize = parseInt(fontSizeInput.value, 10); // ✅ 글씨 크기 가져오기

        // 🔹 썸네일 스타일 적용
        thumbnailPreview.style.width = `${width}px`;
        thumbnailPreview.style.height = `${height}px`;
        thumbnailPreview.style.backgroundColor = backgroundColor;
        thumbnailPreview.style.borderColor = borderColor;

        // 🔹 텍스트 스타일 적용
        thumbnailText.textContent = text;
        thumbnailText.style.color = textColor;
        thumbnailText.style.fontSize = `${fontSize}px`; // ✅ 글씨 크기 적용
        thumbnailText.style.webkitTextStroke = textOutlineColor === "none" ? "none" : `3px ${textOutlineColor}`;

        // 🔹 그림자 효과 적용
        if (textShadow === "none") {
            thumbnailText.style.textShadow = "none";
        } else if (textShadow === "default") {
            thumbnailText.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
        } else if (textShadow === "strong") {
            thumbnailText.style.textShadow = "4px 4px 8px rgba(0, 0, 0, 0.7)";
        }
    });

    // ✅ 글씨 크기 변경 시 자동 썸네일 생성
    fontSizeInput.addEventListener("change", () => {
        generateButton.click();
    });

    // ✅ 글씨 크기 입력 시 자동 썸네일 생성 (키보드 입력 감지)
    fontSizeInput.addEventListener("keyup", () => {
        generateButton.click();
    });


    // ✅ 글씨 그림자 효과 선택 변경 시 자동 썸네일 생성
    textShadowSelect.addEventListener("change", () => {
        generateButton.click();
    });





    // ✅ 이미지 업로드 시 미리보기 적용
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                thumbnailPreview.style.backgroundImage = `url(${e.target.result})`;
                thumbnailPreview.style.backgroundSize = "cover";
                thumbnailPreview.style.backgroundPosition = "center";
                console.log("✅ 업로드한 이미지 적용 완료");
            };
            reader.readAsDataURL(file);
        }
    });

    // ✅ 클립보드에서 이미지 가져오기
    clipboardButton.addEventListener("click", () => {
        alert("📋 클립보드에서 이미지를 가져오려면, 이 창에서 Ctrl + V (붙여넣기)하세요!");
    });

    document.addEventListener("paste", async (event) => {
        const items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf("image") === 0) {
                const blob = item.getAsFile();
                const reader = new FileReader();

                reader.onload = function (e) {
                    thumbnailPreview.style.backgroundImage = `url(${e.target.result})`;
                    thumbnailPreview.style.backgroundSize = "cover";
                    thumbnailPreview.style.backgroundPosition = "center";
                    console.log("✅ 클립보드에서 이미지 가져오기 성공");
                };

                reader.readAsDataURL(blob);
                return;
            }
        }
        alert("❌ 클립보드에 이미지가 없습니다. 다시 시도하세요.");
    });

    // ✅ 썸네일 저장 기능 (고해상도 지원)
    saveButton.addEventListener("click", () => {
        setTimeout(() => {
            html2canvas(thumbnailPreview, { backgroundColor: null, useCORS: true, scale: 2 })
                .then((canvas) => {
                    const link = document.createElement("a");
                    link.download = "thumbnail.png";
                    link.href = canvas.toDataURL("image/png");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch((err) => {
                    console.error("❌ 썸네일 저장 중 오류 발생:", err);
                    alert("❌ 썸네일 저장에 실패했습니다!");
                });
        }, 300);
    });

    // ✅ 썸네일을 클립보드에 복사
    copyButton.addEventListener("click", () => {
        setTimeout(() => {
            html2canvas(thumbnailPreview, { backgroundColor: null, useCORS: true, scale: 2 })
                .then((canvas) => {
                    canvas.toBlob(async (blob) => {
                        try {
                            const clipboardItem = new ClipboardItem({ "image/png": blob });
                            await navigator.clipboard.write([clipboardItem]);
                            alert("✅ 썸네일이 클립보드에 복사되었습니다!");
                        } catch (err) {
                            console.error("❌ 클립보드 복사 중 오류 발생:", err);
                            alert("❌ 클립보드 복사에 실패했습니다! 브라우저의 클립보드 권한을 확인하세요.");
                        }
                    });
                })
                .catch((err) => {
                    console.error("❌ 클립보드 복사 중 오류 발생:", err);
                    alert("❌ 클립보드 복사에 실패했습니다!");
                });
        }, 300);
    });
});




// ✅ 알림창표시(블로그스팟 페이지 이용)
document.addEventListener("DOMContentLoaded", async () => {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkQvWWpyHv4KBQdllIXgD9IU-KMR10iMoGTvOF8GV3t03cEaFaM-c_fT4W1ISszd-O9Q/exec"; // Google Apps Script URL
    const notification = document.getElementById("notification");

    try {
        notification.innerText = "🔔 알람 불러오는 중...";

        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error("알람을 가져올 수 없습니다.");

        const title = await response.text();
        notification.innerText = `📌 ${title}`;
    } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        notification.innerText = "❌ 알람을 가져올 수 없습니다.";
    }
});


// ✅ 알림창표시2(블로그스팟 페이지 이용)
document.addEventListener("DOMContentLoaded", async () => {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwh0yhOXyM6F12K8Me_opqYxIVxpUIs2fo1X0NfcGGRXIlFfwV6y8nokhNh8Jq6hJ7B/exec"; // Google Apps Script URL
    const notification2 = document.getElementById("notification2");

    try {
        notification2.innerText = ""; //알림 불러오기전에 보이는 메시지(현재는 없음)

        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error("알람을 가져올 수 없습니다.");

        const title = await response.text();
        notification2.innerText = ` ${title}`;
    } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        notification2.innerText = "❌ 알람을 가져올 수 없습니다.";
    }
});

