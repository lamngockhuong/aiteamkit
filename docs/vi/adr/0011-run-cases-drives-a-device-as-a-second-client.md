---
title: "ADR 0011: atk:run-cases và atk:verify điều khiển một device như client thứ hai"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-25
updated: 2026-10-25
ticket: none
---

# ADR 0011: atk:run-cases và atk:verify điều khiển một device như client thứ hai

Design: `docs/records/design/261025-2110-run-cases-native-mobile.md`

## Bối cảnh

`atk:run-cases` chỉ chạy các test case đã được duyệt thông qua browser automation của harness. Bước
triage của nó cho mọi case cần device điểm 0 ở tiêu chí 6, buộc case đó thành `MANUAL`, nên một team
test app native iOS hay Android không có lần chạy tự động nào và phải giao mọi case cho
`atk:qa --record`. `atk:verify` chạy local stack và kiểm một thay đổi qua request hoặc browser, nên
một thay đổi trên app native chỉ được kiểm qua backend của nó. `shared/host-capabilities.md` coi
browser automation là capability duy nhất mà khi thiếu sẽ làm một skill dừng lại, và `CLAUDE.md` chỉ
để process management ở `verify` và `orchestrate`. Các artifact QA vốn đã cho phép nêu device ở mục
Compatibility của test plan, cột `Environment` của bảng case, và phần header của run record.

Khi review, Tech Lead đã thêm `atk:verify` vào phạm vi, chọn device thật cho phiên bản đầu, yêu cầu
thêm cột `Platform` vào template case, và yêu cầu một spike có giới hạn thời gian trước khi triển
khai.

## Quyết định

- `atk:run-cases` và `atk:verify` mỗi lần chạy dùng một client: `browser`, là mặc định, hoặc `device`
  (simulator, emulator hoặc device thật). Không thêm skill mới nào.
- `shared/host-capabilities.md` có thêm Device automation, được gọi tên theo việc nó làm và được xác
  định vào lúc dùng. Ngoại lệ dừng lại vẫn là một ngoại lệ của một skill: `atk:run-cases` cần
  automation mà client của nó cần, và khi thiếu thì dừng sau câu hỏi phạm vi và giao phạm vi đó cho
  `atk:qa --record`. `atk:verify` xuống cấp theo cách thông thường và báo rằng app chưa được kiểm.
- Những gì cả hai skill làm trên một device, tức app session, trạng thái sạch, thứ tự các assertion,
  các quy tắc cho device thật, và bước kiểm status bar trên screenshot, nằm trong một file shared mới,
  `shared/device-sessions.md`.
- Với `run-cases`, người chạy mang tới một device đang chạy và đã cài build; lần chạy không bao giờ
  boot, cài hay xóa sạch một device, và không khởi động thứ gì tồn tại lâu hơn một bước. Với `verify`,
  vốn đã có process management, lần chạy build thay đổi, cài nó, boot một simulator hay emulator khi
  chưa có cái nào đang chạy, và chỉ tắt những gì nó đã boot. Không skill nào xóa sạch device thật, và
  `verify` chỉ cài lên device thật khi người đó đồng ý.
- Với `run-cases`, target vẫn là dòng môi trường backend: một device trên máy này không phải target
  local, và một build có backend là production, local hay một dòng khác sẽ bị từ chối. Với `verify`,
  backend của build phải là máy này.
- Mục Verify của profile có thêm một dòng `App` tùy chọn, do `atk:init` phát hiện. Template case có
  thêm cột `Platform` tùy chọn; case dành cho platform khác được bỏ qua, không được chấm điểm.
- Tiêu chí 2 và 6 của triage được nêu riêng cho từng client. Hình dạng của record không đổi.
- Một spike có giới hạn thời gian trên Claude Code chạy trước khi triển khai, và sửa lại bảng triage
  cùng thứ tự các assertion.
- Device automation không xóa dữ liệu app nào, nên trên emulator hay simulator cả hai skill xóa dữ
  liệu đó bằng lệnh mà dòng `App` của profile nêu, trên device mà người chạy đã xác nhận, và không bao
  giờ trên device thật.
- Trên device, một assertion đọc accessibility hierarchy hoặc màn hình đã tới, không bao giờ đọc log
  của app hay một request; version của build đến từ màn hình, rồi lệnh version của profile, rồi người
  chạy; các element của status bar được bỏ khỏi mọi danh sách element được chép vào một record; một
  trường mà hierarchy không nêu được tên là một finding của triage; và lần chạy ghi device ID của
  automation cạnh serial của platform.
- Phiên bản đầu là Android, trên emulator hoặc device thật, được đo trên Claude Code. iOS được hoãn
  sang issue #155, và việc đo trên Cursor và Codex sang issue #156.

## Hệ quả

- Một case trên device quan sát được qua accessibility hierarchy có thể là `AUTO` hoặc `SEMI-*`, và
  một thay đổi trên app native có thể được `verify` kiểm với local stack.
- Các quy tắc production, local, lock, dọn dẹp và screenshot có một bản cho cả hai client, và các quy
  tắc device có một bản cho cả hai skill.
- Một lần chạy browser, một lần chạy `verify` không có dòng `App`, và một file case không có cột
  `Platform` vẫn như cũ.
- Với `run-cases`, người chạy chuẩn bị device và build, và một build cũ có thể làm kết quả sai; bước
  kiểm build với cấu hình của repository, hoặc xác nhận của người đó, sẽ bắt được điều này.
- Device thật kéo theo quy tắc không xóa dữ liệu và rủi ro status bar trên mỗi screenshot.
- Lần chạy trên device chậm hơn, và việc build và boot của `verify` có thể mất vài phút, nên mỗi phiên
  sẽ hoãn nhiều case hơn trong cùng các trần.
- `plugins/atk/shared/` tăng lên hai mươi hai file.
- Spike đã chạy ngày 2026-10-25 trong giới hạn thời gian một ngày, chỉ trên một Android emulator.
- `run-cases` giờ chạy một lệnh trên device, lệnh xóa dữ liệu của profile, nên một profile nêu sai
  lệnh có thể xóa nhầm app; lệnh đó là của team, được review cùng profile.
- Một team test app iOS chưa có client device cho tới khi issue #155 được hoàn tất.

## Các phương án bị loại

- **Một skill mới, `atk:run-mobile-cases`.** Đây là phản xạ mặc định, vì chạy trên mobile có cảm giác
  là một việc khác. Bị loại vì các quy tắc target, lock, dọn dẹp và screenshot sẽ tồn tại hai lần, và
  một bản sửa cho một bên sẽ phải làm hai lần; nó cũng tốn mười hai nhóm file của một skill mới cho
  một skill đọc cùng file case và ghi cùng record.
- **Giữ các case trên device là manual và cải thiện bước bàn giao.** Rẻ nhất và an toàn nhất, nhưng
  không đáp ứng phần nào của yêu cầu. Nó vẫn là hành vi trên harness không có device automation.
- **`run-cases` boot một simulator hay emulator và cài build.** Bị loại vì nó biến `atk:run-cases`
  thành skill thứ ba có process management, và cần đường dẫn SDK, signing và các file build mà không
  profile nào giữ.
- **`verify` giao app cho `run-cases`.** Bị loại vì `run-cases` từ chối local stack, nên nó sẽ cần
  một build đã deploy của một thay đổi chưa merge, đúng khoảng trống mà `verify` tồn tại để lấp.
- **`verify` chỉ kiểm backend và để app cho một người.** Hành vi hiện nay; không đáp ứng phần nào của
  yêu cầu trong review.
- **Viết quy tắc device vào references của từng skill.** Bị loại vì một quy tắc sẽ nằm ở hai chỗ, đi
  ngược mục đích của lớp shared.
