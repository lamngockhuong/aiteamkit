---
title: "Spike: một device automation lộ ra những gì cho agent, cho run-cases và verify trên một app native"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-25
updated: 2026-10-25
ticket: none
---

# Spike: một device automation lộ ra những gì cho agent, cho run-cases và verify trên một app native

Bản tiếng Việt để đọc cho tiện. Bản gốc là `docs/records/design/261025-2201-spike-device-automation.md`; khi hai bản khác nhau, bản
tiếng Anh là bản đúng.

Design: `docs/records/design/261025-2110-run-cases-native-mobile.md`, bản design đã yêu cầu spike này
trong câu trả lời cho Q1.

## Câu hỏi

Thông qua một device automation được tiếp cận như một MCP server từ Claude Code, một agent, trên một
Android emulator, một iOS simulator và một device thật, có thể:

1. đọc accessibility hierarchy của app;
2. thấy và trả lời một dialog hệ thống;
3. đọc phiên bản của build đã cài;
4. thấy network traffic của app;
5. đọc log của app;
6. xóa dữ liệu của app;
7. cài và mở một build được tạo trên máy này hay không?

Câu trả lời gỡ chặn cho bảng Triage trên device của design (tiêu chí 2 và 6), thứ tự các assertion
của nó, và quy tắc trạng thái sạch của `shared/device-sessions.md`. Nó phân tách Phương án A với
Phương án C của Quyết định 1, và V1 với V3 của Quyết định 2: nếu không đọc được hierarchy, không thể
assert điều gì trên device và cả hai quyết định lùi về phương án manual.

## Giới hạn thời gian

Một ngày làm việc, khoảng tám giờ, do Lam Ngoc Khuong đặt ngày 2026-10-25 (Q4 của design). Đã dùng:
khoảng mười lăm phút, từ 22:01 đến 22:15, tính cả cài đặt Android. iOS simulator và các device thật
không được đo: máy này có Command Line Tools mà không có Xcode, và Lam Ngoc Khuong đã chọn ngày
2026-10-25 chỉ cài các tool Android và đọc tài liệu cho iOS và device thật, vì cài Xcode cần App Store
và một Apple ID và sẽ vượt giới hạn hai giờ cài đặt của giới hạn thời gian.

## Thế nào thì được tính là câu trả lời

Viết ra trước khi xem. Với mỗi điểm trong bảy điểm, trên Android emulator:

- **Có**: một tool của automation trả về nó, và một lần chạy Claude Code headless đã dùng nó.
- **Một phần**: chỉ qua command line của chính platform (`adb`), hoặc chỉ được một phần.
- **Không**: không tool nào trả về nó.

Với iOS và device thật, lấy tài liệu của automation cho phiên bản đã dùng, đánh dấu là do nguồn nêu
và không được đo.

## Những gì đã làm

| Bằng chứng | Chi tiết |
|------------|----------|
| Máy | macOS 27.0.1 trên arm64, chỉ có Command Line Tools, không có Xcode, không có Android SDK trước spike |
| Cài đặt | Homebrew `android-commandlinetools` và `openjdk@17`; các gói SDK `platform-tools`, `emulator`, `platforms;android-35`, `build-tools;35.0.0`, `system-images;android-35;google_apis;arm64-v8a`; một AVD `atk-spike`, boot headless trong 26 giây |
| Device automation | `@mobilenext/mobile-mcp@1.0.9`, phát hành 2026-10-09, được chọn vì là bản phát hành mới nhất đã hơn hai tuần tuổi; tắt telemetry bằng `MOBILEMCP_DISABLE_TELEMETRY=1`. Nó là một ví dụ của capability này; kit không gọi tên công cụ nào |
| App prototype | Một app Android một màn hình, package `dev.atk.spike`, phiên bản `0.0.7-spike` (code 7), build trên máy này không dùng Gradle (`aapt2`, `javac`, `d8`, `apksigner`): một bộ đếm lưu trong storage của app và ghi log với tag `ATKSPIKE`, một ô nhập có hint "Your name", một lời chào, một yêu cầu quyền notification, và build được hiển thị trên màn hình. Giữ trong thư mục scratch của phiên, không bao giờ trong repository, và bị bỏ đi cùng thư mục đó |
| Probe | `claude -p` từ Claude Code với `--mcp-config` chỉ chứa server đó, `--strict-mcp-config`, các tool được phép chỉ là của server đó, Bash, Edit và Write bị từ chối; mười ba bước; chạy từ 22:05:55 đến 22:08:48 |
| Kiểm chéo | `adb` từ cùng máy, sau probe: tên AVD, `logcat -d -s ATKSPIKE`, `dumpsys package`, `pm clear`, một screenshot sau khi xóa |
| Nguồn bên ngoài | `README.md` của package ở bản 1.0.9, đọc ngày 2026-10-25 từ tarball npm; tài liệu MCP của Cursor, https://cursor.com/docs/mcp, đọc ngày 2026-10-25; tài liệu MCP của Codex, https://developers.openai.com/codex/mcp, đọc ngày 2026-10-25 |
| Dọn dẹp | Emulator mà spike này khởi động đã được tắt bằng `adb emu kill`; MCP server thoát cùng probe; SDK, AVD và JDK 17 vẫn còn cài trên máy |

## Finding

| # | Finding | Câu trả lời | Mức chắc chắn |
|---|---------|-------------|---------------|
| F1 | **Hierarchy đọc được.** `mobile_list_elements_on_screen` trả về loại, text, content description dưới dạng `label`, resource ID dưới dạng `id`, và vị trí của mỗi element: `TextView text="Count: 0" label="count-label"`, `Button text="Tap me"`. Chạm theo tham chiếu element hoạt động, và `mobile_batch_commands` chạy một lần chạm, một giá trị được gõ và một lần chạm thứ hai trong một lời gọi, rồi liệt kê các element: `Count: 2`, `Hello, Spike` | Có | Được prototype xác nhận, Android emulator |
| F2 | **Một ô chỉ được gọi tên bằng hint thì không có tên.** Ô nhập hiển thị "Your name" trên màn hình, nhưng element của nó không mang text, label hay ID nào; probe tìm ra nó theo vị trí | Một phần | Được prototype xác nhận |
| F3 | **Status bar có trong mọi danh sách element và mọi screenshot.** 23 trong 34 element được liệt kê thuộc về status bar của hệ thống, và screenshot đã lưu cho thấy đồng hồ, mạng và pin | Có, và là một rủi ro | Được prototype xác nhận và bằng cách xem ảnh |
| F4 | **Một dialog hệ thống đọc được và trả lời được.** Dialog quyền notification xuất hiện trong danh sách element với text của nó và hai nút, mỗi nút có một ID của platform (`com.android.permissioncontroller:id/permission_allow_button`); chạm Allow thì quay lại app | Có | Được prototype xác nhận |
| F5 | **Không tool nào trả về phiên bản của build.** `mobile_list_apps` chỉ cho tên và package. Màn hình hiển thị `Build 0.0.7-spike (7)` vì app tự in ra. `adb shell dumpsys package` trả về `versionName=0.0.7-spike` và `versionCode=7` | Một phần: màn hình, hoặc command line của platform | Đã xác nhận |
| F6 | **Không có network traffic.** Không tool nào cho thấy một request hay một response | Không | Được danh sách tool xác nhận |
| F7 | **Log không dùng được để assert thông qua automation.** `mobile_get_device_logs` chỉ bắt các dòng được ghi trong lúc nó chạy, và các lời gọi của probe chạy lần lượt từng cái, nên không lần chạm nào xảy ra trong lúc bắt log và không dòng `ATKSPIKE` nào được trả về. `adb logcat -d -s ATKSPIKE` sau đó giữ đủ cả bốn dòng, từ `count=1` đến `count=4` | Một phần: command line của platform | Đã xác nhận |
| F8 | **Không xóa được dữ liệu của app thông qua automation.** Không tool nào xóa nó; terminate rồi mở lại vẫn giữ `Count: 4`. `adb shell pm clear dev.atk.spike` trả về `Success`, và app mở lại hiển thị `Count: 0` | Một phần: command line của platform | Đã xác nhận |
| F9 | **Một build được tạo trên máy này cài và mở được.** `mobile_install_app` cài file `.apk` theo đường dẫn; `mobile_launch_app` mở nó theo package; `mobile_uninstall_app` và `mobile_terminate_app` có tồn tại | Có | Được prototype xác nhận |
| F10 | **Automation gọi tên device bằng ID riêng của nó.** Nó liệt kê emulator là `atk-spike`, tên AVD, và từ chối `emulator-5554`, serial mà `adb` dùng cho cùng emulator đó (`adb emu avd name` trả về `atk-spike`) | Có, một khác biệt về cách gọi tên | Đã xác nhận |
| F11 | **Telemetry bật theo mặc định.** Package thu thập telemetry sử dụng ẩn danh trừ khi `MOBILEMCP_DISABLE_TELEMETRY` được đặt | Một điểm bảo mật | Do nguồn nêu cho bản 1.0.9 |
| F12 | **Tốc độ.** Mười ba bước, mười một trong số đó là thao tác trên device, mất 2 phút 53 giây ở chế độ headless, tính cả thời gian suy luận của model | Khoảng 15 giây mỗi bước | Đo một lần |
| F13 | **iOS simulator.** Được hỗ trợ; cần Xcode và một simulator đã boot, và điều khiển app thông qua WebDriverAgent trên simulator; cài, mở, terminate và gỡ cài đặt đi qua `xcrun simctl` | Do nguồn nêu | Do nguồn nêu cho bản 1.0.9; không được đo |
| F14 | **Device thật.** iOS: một device kết nối qua USB và đã được tin cậy, một tunnel, và WebDriverAgent chạy trên đó. Android: `adb` với USB debugging đã bật và đã được cấp quyền | Do nguồn nêu | Do nguồn nêu cho bản 1.0.9; không được đo |
| F15 | **Cursor và Codex.** Cả hai đều có tài liệu cho MCP server qua stdio: Cursor trong `.cursor/mcp.json` hoặc `~/.cursor/mcp.json`, Codex trong `[mcp_servers.<name>]` của `config.toml`, file của project chỉ trong một project được tin cậy | Do nguồn nêu | Do các nguồn nêu, đọc ngày 2026-10-25; không được đo |

## Khuyến nghị

Phương án A và V1 của design đứng vững: F1, F4 và F9 cho thấy một agent có thể điều khiển một app
native và assert trên những gì hierarchy giữ. Không điều gì tìm được nghiêng về Phương án C hay V3.
Các finding sửa lại năm phần của design:

1. **Tiêu chí 2 trên device.** Status và body của một request nằm ngoài tầm (F6), và log của app không
   đáng tin khi đi qua automation (F7). Chấm chúng 0 trên device trừ khi người chạy nêu ra một cách,
   và bỏ "log của app khi automation cung cấp" khỏi thứ tự các assertion, thứ tự này trở thành
   hierarchy, rồi tới màn hình đã tới.
2. **Trạng thái sạch.** Việc xóa dữ liệu app (F8) và đọc phiên bản của build (F5) được làm bằng
   command line của chính platform, không phải bằng automation. Khuyến nghị `shared/device-sessions.md`
   nói rõ điều đó, và lệnh đến từ dòng `App` của profile thay vì từ văn bản của skill, như các lệnh
   khác của `verify`. Việc `run-cases`, hiện không chạy lệnh nào trên device, có được xóa dữ liệu của
   một emulator theo cách này hay không là lựa chọn của Tech Lead (Vẫn chưa biết, U1).
3. **Bước kiểm status bar cũng áp dụng cho danh sách element** (F3). Một danh sách element được chép
   vào run log hay một defect mang theo text của notification giống như một screenshot.
4. **Một ô không có tên là một grounding finding** (F2). Một ô mà hierarchy không gọi tên được thì
   được tiếp cận theo vị trí, đó là một rủi ro của tiêu chí 3; triage report nêu tên nó, và grounding
   trong code cho ra tên của nó.
5. **Hai ID cho mỗi device** (F10). Run log ghi ID device của automation cạnh serial của platform, để
   một đồng đội tìm được device bằng tool nào cũng được.

Hai ghi chú cho `shared/host-capabilities.md`: một device automation có thể gửi telemetry theo mặc
định (F11), điều mà người dùng cấu hình, và Cursor và Codex có thể tiếp cận cùng loại server đó theo
tài liệu của chúng (F15).

## Vẫn chưa biết

| ID | Điều chưa biết | Ai có thể trả lời | Bước tiếp theo |
|----|----------------|-------------------|----------------|
| U1 | `run-cases` có được xóa dữ liệu app của một emulator hay simulator bằng lệnh của platform không, hay chỉ được mở lại | Lam Ngoc Khuong, với vai trò Tech Lead | Một phán quyết được ghi vào design thông qua `--answer` |
| U2 | iOS simulator có cho cùng hierarchy, dialog và việc cài đặt như F1, F4 và F9 không | Lam Ngoc Khuong, hoặc một đồng đội có Xcode | Một spike thứ hai khoảng ba giờ trên một máy có Xcode |
| U3 | Một device iOS hay Android thật có hoạt động như nguồn nêu không | Lam Ngoc Khuong, hoặc một đồng đội có device test | Cùng probe đó trên một device test được kết nối, chỉ giữ tài khoản test |
| U4 | Cursor và Codex có chạy probe như Claude Code đã chạy không | Lam Ngoc Khuong | Cùng probe đó thông qua cấu hình MCP riêng của từng harness |
