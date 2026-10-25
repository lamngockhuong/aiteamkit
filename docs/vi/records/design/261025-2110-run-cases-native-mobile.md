---
title: atk:run-cases và atk:verify điều khiển một app mobile native thông qua device automation của harness
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-25
updated: 2026-10-25
ticket: none
---

# atk:run-cases và atk:verify điều khiển một app mobile native thông qua device automation của harness

Bản tiếng Việt để đọc cho tiện. Bản gốc là `docs/records/design/261025-2110-run-cases-native-mobile.md`; khi hai bản khác nhau, bản
tiếng Anh là bản đúng.

## Tóm tắt

`atk:run-cases` chỉ chạy các test case đã được duyệt thông qua web browser, và `atk:verify` chỉ kiểm
một thay đổi thông qua request và browser. Một team xây dựng app native iOS hay Android không nhận
được lần chạy tự động nào từ cả hai. Trong `run-cases`, mọi case cần app trên device đều nhận điểm 0
ở tiêu chí 6 của triage và bị ép thành `MANUAL`. Trong `verify`, bản thân app không bao giờ được
chạy, nên một thay đổi trên app chỉ được kiểm qua backend của nó.

Bản design này thêm một **client** cho cả hai skill: hoặc browser, như hiện nay, hoặc một app trên
điện thoại, simulator hay emulator. Nó đưa ra bảy quyết định.

1. **Không có skill mới.** `atk:run-cases` giữ tám bước, các quy tắc an toàn, triage và record của
   nó, và chọn client ở bước 2. `atk:verify` giữ các bước và process management của nó, và chạy app
   ở chỗ thay đổi chạm tới app. Không thêm skill mới nào.
2. **Device automation là capability thứ hai, được gọi tên theo việc nó làm**, đặt cạnh browser
   automation trong `shared/host-capabilities.md`: điều khiển một app đã cài trên device, đọc
   accessibility hierarchy của nó, chạm, gõ, vuốt và chụp screenshot. Nó không bao giờ được gọi bằng
   tên công cụ cung cấp nó. Nó chỉ làm dừng `run-cases`, như browser automation; `verify` xuống cấp
   theo cách thông thường khi thiếu nó.
3. **Những gì cả hai skill làm trên một device nằm trong một file shared**, `shared/device-sessions.md`:
   các loại device, quy tắc trạng thái sạch, thứ tự các assertion, các quy tắc cho device thật, và
   bước kiểm status bar trên screenshot. (Thay đổi theo yêu cầu review R1: file này thay cho reference
   riêng của `run-cases` mà phiên bản đầu của design đề xuất.)
4. **`run-cases` không bao giờ boot, cài hay xóa sạch một device; `verify` có thể boot và cài.**
   Với `run-cases`, người chạy mang tới một device đang chạy và đã cài build, và skill này vẫn là
   skill không khởi động thứ gì tồn tại lâu hơn một bước. `verify` vốn đã có process management, nên
   nó build app đã thay đổi từ working tree, cài nó, boot một simulator hay emulator khi chưa có cái
   nào đang chạy, và tắt những gì nó đã boot. (R1) Cả hai có thể xóa dữ liệu của app trên emulator
   hay simulator, chỉ bằng lệnh mà dòng `App` của profile nêu, không bao giờ trên device thật. (U1)
5. **Các quy tắc target đi theo hai hướng ngược nhau, như hiện nay.** Với `run-cases`, target là
   dòng môi trường backend: một device trên máy này không phải target local, và một build có backend
   là production hay local sẽ bị từ chối. Với `verify`, backend phải là local, và một build trỏ đi bất
   kỳ đâu khác sẽ làm dừng lần chạy. (R1)
6. **Device thật có trong phiên bản đầu (Q2), template case có thêm cột `Platform` tùy chọn (Q3),
   và một spike có giới hạn thời gian chạy trước khi triển khai (Q1).** Spike đã chạy ngày
   2026-10-25 trong giới hạn thời gian một ngày (Q4).
7. **Phiên bản đầu là Android, được đo trên Claude Code.** iOS được hoãn sang issue #155, và việc đo
   trên Cursor và Codex sang issue #156. (R2)

Lam Ngoc Khuong phê duyệt. Không còn câu hỏi nào mở: cả năm đề xuất khác của spike đều được nhận
(Q5).

## Yêu cầu

Chưa có artifact yêu cầu. Yêu cầu đến trong phiên ngày 2026-10-25, sau câu trả lời rằng kit không
chạy case trên app mobile native: "mở design-doc cho hỗ trợ mobile native". Yêu cầu thứ hai đến trong
review cùng ngày: "Tôi cũng cần verify có thể test được mobile app" (R1). Các tiêu chí chấp nhận dưới
đây được nêu lại từ các yêu cầu đó và từ hành vi hiện nay, và là các tiêu chí mà người phê duyệt dùng
để đối chiếu design này.

| ID | Tiêu chí chấp nhận | Chỗ design đáp ứng |
|----|----------------------|---------------------------|
| AC1 | Một case trên app native iOS hay Android, có kết quả quan sát được trên device, có thể được triage thành `AUTO` hoặc `SEMI-*` và được chạy, thay vì luôn là `MANUAL`. Android trong phiên bản đầu, iOS theo issue #155 (R2) | Quyết định 1; Triage trên device |
| AC2 | Capability điều khiển device được gọi tên theo việc nó làm, được xác định từ harness vào lúc dùng, với quy tắc xuống cấp riêng trong `shared/host-capabilities.md` | Quyết định 2 |
| AC3 | Mọi quy tắc an toàn của lần chạy browser vẫn đúng trên device: không production, không local stack, ngưỡng lock, dữ liệu chỉ được tạo qua sản phẩm và xóa theo identifier, screenshot được một người xác nhận | Quyết định 5; Target trên device; Bằng chứng trên device |
| AC4 | Run record giữ hình dạng của `skills/qa/references/test-run.md`, để `atk:qa --bug` và `atk:qa --retest` đọc nó mà không phải đổi gì | Output và record |
| AC5 | Một lần chạy browser của `run-cases` và một lần chạy `verify` trên dự án không có app hoạt động đúng y như hiện nay | Tương thích ngược |
| AC6 | `atk:verify` có thể chạy một app native đã thay đổi với local stack, kiểm nó trên device, và assert các side effect của nó, trong trần và process management hiện có (R1) | Quyết định 4; `atk:verify` trên device |

Không có gì trong design nằm ngoài sáu tiêu chí này. Việc sinh code test end-to-end lâu dài cho mobile
không nằm trong đó, và vẫn thuộc về `atk:implement`, như với web hiện nay.

## Hiện trạng

Trích tại commit `b7256ca`.

**Chính lời của `run-cases` nói nó chỉ dùng browser.** Description nói nó chạy case "against a
deployed DEV or staging environment through the browser"
(`plugins/atk/skills/run-cases/SKILL.md:4`), và phần mở đầu nhắc lại điều đó (`SKILL.md:21-23`). Bước
1 kiểm có browser automation không, và khi không có thì kết thúc lần chạy sau bước 5 bằng việc bàn
giao cho `atk:qa --record` (`SKILL.md:97-100`, `SKILL.md:131-133`). Bước 7 đóng "the browser session
this run opened" (`SKILL.md:148`), và definition of done kiểm đúng điều đó (`SKILL.md:211-212`).

**Triage loại thẳng device.** Tiêu chí 6 cho điểm 0 với case thao tác "Outside the browser: an
operating system dialog, a mail client, a device, a downloaded file"
(`plugins/atk/skills/run-cases/references/triage.md:90`), và bất kỳ tiêu chí 6 nào bằng 0 đều làm case
thành `MANUAL` vô điều kiện (`triage.md`, The verdict, bước 1). Tiêu chí 2 chấm khả năng quan sát qua
"the page's accessibility tree, the URL, a status code, or a response body" (`triage.md:86`), ba thứ
trong đó app native không có ở cùng dạng. Recon đăng nhập qua "the browser session recon opens"
(`triage.md:71-73`).

**Phần thực thi giả định có một trang.** `references/execution.md:6-19` là mục tên The browser: một
browser session cho cả lần chạy, viewport đặt một lần, và chỉ đóng session mà lần chạy này mở. Thứ tự
assertion là "the page's accessibility tree; the URL after a navigation or a guard; the status and body
of the request the page made; the console" (`execution.md:42-45`). `Environment` của một defect là
"the build, the row's name, the browser and viewport, and the account by role" (`execution.md:240`).

**Target là một URL.** Dòng môi trường cung cấp "the base URL" (`environment-safety.md:28`). Việc từ
chối local kích hoạt khi `Kind` là `local` hoặc là địa chỉ loopback hay địa chỉ của chính máy này
(`environment-safety.md:60`), điều hiện nay không mơ hồ vì browser chỉ là cửa sổ nhìn vào target.
Một cổng chắn trước ứng dụng là HTTP `401` với `WWW-Authenticate`, phải qua lại mỗi khi "the browser
session is reset" (`environment-safety.md:139-147`).

**`verify` chạy local stack và tương tác qua request hoặc browser.** (R1) Phạm vi của nó là "starting
the application the way `.atk/profile.md` says to start it, waiting for the readiness signal,
exercising the change with real requests or real interaction" và "stopping every process it started"
(`plugins/atk/skills/verify/SKILL.md:27-30`). Một host không phải máy này làm dừng lần chạy
(`verify/SKILL.md:101-107`). Với `--ui`, `references/ui-checks.md` so sánh màn hình ở "a narrow phone
width, a tablet width, and a wide desktop width" (`verify/references/ui-checks.md:28-30`) và đi qua một
luồng với "the real clicks, the real typing" (`ui-checks.md:77-81`). `## Process management` buộc
`verify` ghi lại lệnh, PID và port của mọi thứ nó khởi động và dừng chúng (`verify/SKILL.md:205-235`),
và quy tắc port của nó nói về "which one the browser is talking to" (`verify/SKILL.md:220`). `SKILL.md`
dài 299 dòng, dưới trần của `CONV-006` đúng một dòng.

**Profile không có app.** (R1) Mục Verify chứa `Start`, `Ready when`, `Logs`, `Data check`,
`Prepare`, `Shared stores`, `Cleanup` và `Local only`
(`plugins/atk/skills/init/references/profile-template.md:143-153`); không dòng nào nói cách build một
app, cài nó, hay app identifier nào cần mở. `shared/project-profile.md:191` liệt kê đúng các trường đó
là chỉ `verify` đọc.

**Quy tắc capability có một ngoại lệ, được viết theo browser automation.**
`plugins/atk/shared/host-capabilities.md:109-114` nói không skill nào dừng vì thiếu một host
capability, với browser automation là ngoại lệ duy nhất. `host-capabilities.md:116-138` định nghĩa
browser automation theo việc nó làm, cấm nêu tên plugin hay server cung cấp nó, và kết thúc bằng: "it
stays the only one: a skill whose work a browser only improves degrades the usual way". Terminal
multiplexer là capability kia của máy được gọi tên theo việc nó làm (`host-capabilities.md:378-383`),
và nó không làm dừng skill nào.

**Các artifact QA vốn đã cho phép device.** Mục Compatibility của test plan có cột "Browser, OS, or
device" (`plugins/atk/skills/qa/references/test-plan-template.md:93`). Cột `Environment` của bảng case
là "The browser, device, or build the case ran on"
(`plugins/atk/skills/qa/references/test-case-template.md:113`). Trường header của run record là
"build, environment, browser or device, account by role"
(`plugins/atk/skills/qa/references/test-run.md:196`). Vì vậy hình dạng record không cần đổi để đáp ứng
AC4. Bảng case không có cột platform (`test-case-template.md:82`), nên không có gì trong file case nói
một case chỉ dành cho iOS hay chỉ dành cho Android.

**Process management do hai skill nắm.** `CLAUDE.md`, mục Skill folder layout, cho `verify` và
`orchestrate` một mục `## Process management` vì chúng khởi động những thứ tồn tại lâu hơn một bước,
và nói `atk:run-cases` giữ một browser session "through the harness's browser automation rather than a
process it starts and must stop". Một lần chạy `run-cases` mà boot emulator sẽ phá câu đó; một lần chạy
`verify` boot emulator thì không, vì `verify` là một trong hai skill đó.

**`plugins/atk/shared/` có hai mươi mốt file**, và một quy tắc mà hai skill trở lên cần thì đặt ở đó
(`CLAUDE.md`, mục "`shared/` is the DRY layer").

Điều khiến cách làm hiển nhiên không khả thi: chép `run-cases` thành một bản sao cho mobile sẽ nhân đôi
`environment-safety.md` (153 dòng) và `triage.md` (199 dòng), hai file mà quy tắc không bao giờ được
lệch nhau; boot device từ `run-cases` sẽ thêm skill thứ ba có process management; và viết các quy tắc
device vào `run-cases` và `verify` riêng rẽ sẽ đặt một quy tắc ở hai chỗ.

## Các phương án

### Tiêu chí quyết định

| Tiêu chí | Nó hỏi gì |
|-----------|--------------|
| Ngang bằng về an toàn | Mọi quy tắc giữ lần chạy tránh xa production và dữ liệu của người khác có còn đúng, từ một bản duy nhất không? |
| Công sức | Bao nhiêu file thay đổi, tính cả mười hai nhóm của một skill mới |
| Khả năng đảo ngược | Có gỡ bỏ được mà không phải viết lại các record đã ghi không? |
| Bất biến của kit | Có giữ được "gọi tên theo việc nó làm", một ngoại lệ dừng, process management ở hai skill, và `verify/SKILL.md` dưới 300 dòng không? |
| Trung thực của kết quả | Một case có còn đảm bảo không bao giờ nhận kết quả mà không ai quan sát không? |

### Quyết định 1: `run-cases` tiếp cận device thế nào

#### Phương án A: một skill, client được chọn ở bước 2 (được chọn)

`atk:run-cases` có thêm một client, `browser` hoặc `device`. Các bước 1 tới 8 giữ nguyên. Các quy tắc
chung cho cả hai client giữ nguyên chỗ; những gì device thêm vào đến từ `shared/device-sessions.md`
(R1). `shared/host-capabilities.md` có thêm Device automation cạnh Browser automation, và ngoại lệ dừng
trở thành "automation mà client của lần chạy cần".

```mermaid
flowchart TD
  A["Bước 2: chọn dòng target"] --> B{"Client?"}
  B -->|"browser"| C["Có browser<br/>automation?"]
  B -->|"device"| D["Có device<br/>automation?"]
  C -->|"có"| E["Bước 3 tới 8"]
  D -->|"có"| F["Kiểm device và build"]
  F --> E
  C -->|"không"| G["Dừng sau phạm vi:<br/>QA: atk:qa --record"]
  D -->|"không"| G
```

#### Phương án B: một skill mới, `atk:run-mobile-cases`

Phương án một team sẽ chọn theo mặc định: chạy trên mobile có cảm giác là một việc khác, và một skill
mới để nguyên skill browser. Nó thua về ngang bằng an toàn. Các quy tắc target, ngưỡng lock, quy tắc
marker và dọn dẹp, và bước kiểm screenshot sẽ tồn tại hai lần hoặc bị trích chéo giữa các skill, và
một bản sửa cho một bên, chẳng hạn bước kiểm production trên một host name, sẽ phải làm hai lần. Nó
cũng tốn mười hai nhóm file của `CONV-001` và đưa số skill từ 25 lên 26, cho một skill đọc cùng file
case và ghi cùng record.

#### Phương án C: giữ các case trên device là manual, và cải thiện bước bàn giao

Triage giữ tiêu chí 6 ở 0 với device, nhưng ghi lý do `needs a device` và gom các case đó cho tester,
và `atk:qa --record` có thêm một checklist cho device. Rẻ nhất và an toàn nhất, và không đáp ứng phần
nào của AC1. Đây là phương án dự phòng mà phương án được chọn vốn đã giữ cho harness không có device
automation.

#### Chấm điểm

| Tiêu chí | A: một skill, hai client | B: một skill mới | C: bàn giao manual |
|-----------|---------------------------|----------------|--------------------|
| Ngang bằng về an toàn | Một bản cho mọi quy tắc | Hai bản, hoặc trích chéo giữa các skill | Không đổi, không có gì mới chạy |
| Công sức | 4 file skill, các file shared, docs | Một skill mới: mười hai nhóm file, số đếm 26 | 2 file |
| Khả năng đảo ngược | Revert commit; record vẫn hợp lệ | Xóa skill; record vẫn hợp lệ | Không đáng kể |
| Bất biến của kit | Giữ được, với ngoại lệ được viết lại | Giữ được, nhưng hai skill giữ ngoại lệ | Giữ được |
| Trung thực của kết quả | Cùng quy tắc phán quyết; điểm tiêu chí theo từng client | Như nhau, nếu các bản sao đi cùng nhịp | Như nhau |
| Đáp ứng AC1 | Có | Có | Không |

### Quyết định 2: `verify` tiếp cận device thế nào (R1)

Được thêm theo yêu cầu review R1, chấm theo cùng các tiêu chí.

#### Phương án V1: `verify` chạy app nó đã build, trên device, dưới process management của nó (được chọn)

`verify` có cùng hai client. Ở chỗ thay đổi chạm tới app, bước 2 build app từ working tree bằng dòng
`App` mới của profile, cài nó lên device, boot một simulator hay emulator khi chưa có cái nào đang
chạy, và ghi từng việc vào report như process management yêu cầu. Bước 3 tương tác qua device
automation của harness và assert side effect trong local stack như hiện nay. Khi không có device
automation, `verify` vẫn khởi động stack và assert qua request, và report nói app chưa được kiểm và vì
sao: cách xuống cấp thông thường.

#### Phương án V2: `verify` giao app cho `run-cases`

`verify` chỉ kiểm backend và nêu `atk:run-cases` cho app. Bị loại: `run-cases` từ chối local stack, nên
nó sẽ cần một build đã deploy của một thay đổi chưa merge, đúng khoảng trống mà `verify` tồn tại để lấp;
và `run-cases` chạy các QA case đã được duyệt, không phải tiêu chí chấp nhận của một developer.

#### Phương án V3: `verify` kiểm backend, và app là một bước manual

Điều đang xảy ra hiện nay, và là mặc định một team sẽ chấp nhận nếu không có design này. `verify`
assert các side effect của API, và report liệt kê các tiêu chí chấp nhận của app là chưa được kiểm để
một người đi qua. Rẻ, và không đáp ứng phần nào của AC6.

#### Chấm điểm

| Tiêu chí | V1: app trên device | V2: giao cho `run-cases` | V3: bước app manual |
|-----------|---------------------|-------------------------|---------------------|
| Ngang bằng về an toàn | Giữ bước kiểm chỉ-local; quy tắc device từ file shared | Quy tắc của `run-cases`, nhưng trên một build chưa merge đã deploy | Không đổi |
| Công sức | Các reference của `verify`, dòng profile, phần phát hiện của `init` | Một bước bàn giao chéo skill và một bước deploy nằm ngoài kit | 1 file |
| Khả năng đảo ngược | Revert; report vẫn hợp lệ | Revert | Không đáng kể |
| Bất biến của kit | Process management vẫn ở `verify`; sửa `SKILL.md` ngay trong dòng, chi tiết đặt trong references | Giữ được | Giữ được |
| Trung thực của kết quả | Report nói app có được kiểm hay không | Một khoảng cách giữa thay đổi đã verify và thay đổi đã deploy | Report nói chưa được kiểm |
| Đáp ứng AC6 | Có | Không | Không |

### Quyết định phụ: ai khởi động device

| Skill | Quy tắc | Vì sao |
|-------|------|-----|
| `run-cases` | **Người chạy mang tới một device đang chạy và đã cài build (được chọn)** | Không gì lần chạy khởi động tồn tại lâu hơn nó; không process management; không cần quyền signing hay cài đặt; device thật không bao giờ bị lần chạy xóa sạch. Phương án bị loại, lần chạy tự boot và cài, sẽ biến nó thành skill thứ ba có process management và cần đường dẫn SDK, signing và các file build mà không profile nào giữ. Việc xóa dữ liệu của app trên emulator hay simulator bằng lệnh của profile không khởi động process nào và được phép (U1) |
| `verify` | **Lần chạy build và cài thay đổi, và boot một simulator hay emulator khi chưa có cái nào đang chạy (được chọn, R1)** | Build được kiểm là working tree, nên không ai khác mang nó tới được; `verify` vốn đã ghi lại và dừng những gì nó khởi động. Trên device thật nó chỉ cài khi người đó đồng ý, theo mục Device thật bên dưới |

## Cách tiếp cận được chọn

### Client

Một lần chạy của mỗi skill có đúng một client:

- `browser`, là mặc định, và là giá trị duy nhất khi không có gì bên dưới đòi hỏi device.
- `device`, với platform, loại device (`emulator` hoặc `real`, device thật cũng tính theo Q2), phiên
  bản OS, và build. Phiên bản đầu chỉ cung cấp `Android`; một device iOS bị từ chối bằng một dòng nói
  rằng phiên bản này không điều khiển iOS, và lần chạy tiếp tục mà không có client device, theo issue
  #155 (R2). Khi iOS được thêm vào, `simulator` sẽ gia nhập các loại device.

Với `run-cases`, bước 2 chốt client cùng với target trong cùng câu hỏi xác nhận, đưa ra các giá trị từ
các dòng Compatibility của test plan khi có. Với `verify`, bước 1 chốt client dựa trên những gì thay đổi
chạm tới: một thay đổi nằm dưới thư mục của app trong dòng `App` của profile sẽ đòi device, và người
chạy xác nhận device nào (R1).

Một file case bao cả web app lẫn mobile app được chạy một lần cho mỗi client. Mỗi lần chạy ghi record
riêng, có `Environment` nêu client của nó, điều mà `test-run.md:196` vốn đã cho phép.

### Device automation, trong `shared/host-capabilities.md`

Một mục mới, Device automation, sau Browser automation:

- **Nó là gì.** Agent điều khiển một app đã cài trên điện thoại, simulator hay emulator: mở và dừng
  app, đọc accessibility hierarchy của nó, chạm, gõ, vuốt, bấm nút back hay home của hệ thống, trả lời
  một dialog hệ thống, và chụp screenshot.
- **Gọi tên thế nào.** "The harness's device automation", không bao giờ là server, framework hay công
  cụ cung cấp nó trên một máy, vì cùng lý do browser automation đưa ra.
- **Xác định thế nào.** Từ những gì harness liệt kê vào lúc dùng. Khi có nhiều cái được liệt kê, dùng
  cái người chạy nêu tên, hoặc hỏi. Nó điều khiển được những platform và loại device nào thì đọc từ
  công cụ, không bao giờ giả định: một automation chỉ liệt kê device Android thì không cung cấp client
  iOS.
- **Ngoại lệ.** Đoạn ở `host-capabilities.md:131-138` được viết lại để nói rằng `atk:run-cases` cần
  automation mà client của nó cần, browser hay device, và xuống cấp như hiện nay: dừng sau câu hỏi phạm
  vi, giữ triage report, và giao phạm vi cho `atk:qa --record`. Câu "it stays the only one" được giữ:
  một skill, một quy tắc. `atk:verify` được nêu là xuống cấp theo cách thông thường (R1).
- **Ai khởi động device.** Device và server riêng của automation thuộc về máy của người chạy.
  `run-cases` đóng app session mà nó mở và không bao giờ dừng device, simulator hay server của
  automation. `verify` có thể boot một simulator hay emulator, dưới `## Process management` của nó, và
  chỉ tắt những gì nó đã boot (R1).

### `shared/device-sessions.md` (R1)

Một file shared mới, được `run-cases` và `verify` trích, cho những gì cả hai làm trên device:

- **Một app session cho mỗi lần chạy**, được mở lúc bắt đầu. Reset nó nghĩa là mở lại app.
- **Trạng thái sạch (U1).** Device automation không cung cấp cách nào để xóa dữ liệu của app (spike
  F8), nên trên emulator hay simulator, dữ liệu được xóa bằng lệnh xóa của dòng `App` trong profile,
  chẳng hạn lệnh xóa của công cụ platform cho app identifier đó, và app được mở lại. Lệnh đến từ
  profile, không bao giờ từ chữ của skill, chỉ được chạy trên device mà người chạy đã xác nhận cho
  lần chạy, và mỗi lần chạy lệnh được ghi vào run log hoặc report. Khi profile không nêu lệnh nào như
  vậy, một lần chạy lại bắt đầu từ việc mở lại app. Trên device thật, dữ liệu không bao giờ bị xóa:
  một lần chạy lại bắt đầu từ việc mở lại app, và một case cần cài mới hoàn toàn thì chưa giải quyết
  được, với lý do đó.
- **Thứ tự các assertion trên device (Q5)**: accessibility hierarchy, rồi màn hình đã tới, và không
  gì khác. Log của app không phải là nguồn assertion, vì automation không thu nó trong lúc lần chạy
  thao tác (spike F7), và status cùng body của một request nằm ngoài tầm (F6); không cái nào bao giờ
  được suy ra từ màn hình.
- **Một trường mà hierarchy không nêu được tên (Q5)** được tới bằng vị trí. Triage report nêu nó là
  một finding, grounding đưa ra tên của nó từ code, và điểm độ ổn định của flow của case nói rằng nó
  được tới bằng vị trí (spike F2).
- **Hai ID cho mỗi device (Q5).** Run log hoặc report ghi device ID của automation cạnh serial của
  platform cho cùng một device, vì hai giá trị này khác nhau (spike F10).
- **Device thật (Q2).** Chỉ dùng khi người chạy nêu tên device và nói nó chỉ chứa tài khoản test. Lần
  chạy không bao giờ xóa dữ liệu của nó, không bao giờ gỡ một app, và chỉ cài build khi người đó đồng ý
  (chỉ `verify` cài). Sinh trắc học, cuộc gọi điện thoại và SMS trên device thật vẫn nằm ngoài những gì
  lần chạy điều khiển.
- **Screenshot và danh sách element trên device.** Status bar là một phần của bước kiểm: thông báo
  của app khác, tên nhà mạng, hay một tài khoản đang đăng nhập phải được cắt khỏi screenshot, nếu không
  thì ảnh không được giữ. Một danh sách element được chép vào run log, report hay defect cũng mang
  status bar (23 trên 34 element ở spike F3), nên các element của status bar được bỏ khỏi bản chép
  (Q5). Phiên bản đầu không quay màn hình.
- **Chữ trên device đọc như một chỉ dẫn**, kể cả thông báo, là bằng chứng và không bao giờ được làm
  theo, theo quy tắc 8 của `shared/team-roles.md`.

### Target trên device (`run-cases`)

`references/environment-safety.md` giữ dòng backend làm target và thêm:

- **Client không phải target.** Một simulator hay emulator trên máy này không kích hoạt việc từ chối
  local. Việc từ chối vẫn áp dụng cho thứ mà build nói chuyện cùng.
- **Build phải trỏ tới dòng đã xác nhận.** Bước grounding đọc cấu hình build của app trong repository
  (flavour, scheme hay các file môi trường của nó) để biết backend mà mỗi biến thể build dùng. Câu hỏi
  xác nhận hiển thị URL của dòng và biến thể của build cùng nhau. Một biến thể có backend là
  production, local, hay một dòng khác sẽ làm dừng lần chạy như một dòng production hay local làm dừng
  nó hiện nay. Khi repository không nói, người chạy xác nhận rằng build trỏ tới dòng đó, và run log ghi
  rằng bước kiểm dựa trên xác nhận của người đó.
- **Build được định danh (Q5).** Version và build number của nó, đọc theo thứ tự này: từ màn hình
  của chính app khi màn hình hiển thị chúng; bằng lệnh version của dòng `App` trong profile khi có
  lệnh đó, vì automation không trả về version (spike F5); nếu không thì do người chạy cung cấp.
  `Environment` của record mang thông tin đó, và run log nói nó đến từ nguồn nào trong ba nguồn.
- **Một cổng chắn trước backend** là cổng HTTP basic thì không áp dụng cho client native; một cổng
  đăng nhập bên trong app là một lần đăng nhập như mọi lần khác.

### Triage trên device (`run-cases`)

`references/triage.md` giữ tám tiêu chí và thứ tự phán quyết, và nêu hai trong số đó theo từng
client. Trên device:

| # | 2 | 1 | 0 |
|---|---|---|---|
| 2 | Trong accessibility hierarchy của app, hoặc màn hình đã tới | Tới được gián tiếp: một màn hình khác, kéo để làm mới, mở lại app | Ngoài tầm: pixel, một file, một mail, nội dung push notification khi automation không đọc được, một server log, status hay body của một request, log của app (Q5) |
| 6 | Mở app, chạm, gõ, chọn, cuộn | Vuốt, nhấn giữ, dialog quyền hệ thống, xoay màn hình, nút back của hệ thống | Ngoài app: một app khác, camera hay micro với đầu vào thật, sinh trắc học trên device thật, cuộc gọi điện thoại hay SMS |

Sinh trắc học, vị trí và push notification được chấm 1, không phải 0, trên simulator hay emulator khi
automation giả lập được chúng, và triage report nói điểm đó phụ thuộc vào điều này. Các giá trị trong
bảng được spike xác nhận hoặc sửa lại trước khi triển khai (Q1).

**Cột `Platform` (Q3).** Một case có ô `Platform` nêu platform khác với client của lần chạy sẽ được bỏ
qua, được đếm trong triage report cạnh các dòng đã loại, và không bao giờ được chấm điểm. Ô trống, hoặc
file không có cột đó, nghĩa là mọi client. Một case không có `Platform` mà nêu một điều khiển chỉ một
platform có, như nút back của Android trong lần chạy iOS, là `BLOCKED` với lý do đó, giống như một
trang mà grounding không tìm thấy. Một trường mà hierarchy không nêu được tên là một finding của
triage report và chấm tiêu chí 3 không quá 1, theo `shared/device-sessions.md` (Q5).

Recon đăng nhập qua app trên device, một lần, và giữ app session đó, như nó giữ browser session hiện
nay.

### Thực thi trên device (`run-cases`)

`references/execution.md` đổi tên The browser thành The client và giữ nó trung lập với client, trích
`shared/device-sessions.md` cho app session, trạng thái sạch và thứ tự các assertion (R1). Dữ liệu được
tạo qua app và được đánh dấu bằng cùng marker, và bước dọn dẹp xóa nó theo identifier như hiện nay. Khi
identifier mà app hiển thị khác với identifier của backend, run log ghi cả hai.

### Bằng chứng trên device

Screenshot theo `execution.md`, Evidence, và Evidence của `verify` trong `ui-checks.md`, không đổi, có
thêm bước kiểm status bar của `shared/device-sessions.md`: chụp lúc lỗi xảy ra, được kiểm, được người
chạy xác nhận trước khi một record link tới chúng.

### `atk:verify` trên device (R1)

- **Profile có thêm dòng `App`** trong mục Verify, tùy chọn: theo từng platform, thư mục của app, lệnh
  build nó và cài nó lên một device được nêu tên cho local stack, app identifier để mở, và lệnh xóa
  dữ liệu của nó trên emulator, mà `run-cases` cũng đọc (U1). `atk:init` phát hiện nó từ repository
  (một module Android Gradle, cấu hình của một app đa nền tảng; một Xcode project khi iOS được thêm
  vào, theo R2) và hỏi những gì không file nào trả lời được. Profile không có dòng `App` nghĩa là `verify`
  chạy như hiện nay.
- **Bước 1, client.** Khi thay đổi chạm tới thư mục của app, lần chạy hỏi device nào: một cái đang
  chạy, hoặc một simulator hay emulator mà nó boot. Device thật cần người đó đồng ý mới được cài, theo
  `shared/device-sessions.md`.
- **Bước kiểm chỉ-local bao cả app.** Backend của build phải là máy này, đọc theo cùng cách `run-cases`
  đọc, và cho phép địa chỉ mà device dùng để tới host: alias của emulator cho loopback của host, hoặc
  địa chỉ của máy này trong mạng local với device thật. Một build trỏ đi bất kỳ đâu khác làm dừng lần
  chạy, như một host không phải local hiện nay.
- **Bước 2, khởi động.** Sau khi stack sẵn sàng: boot simulator hay emulator khi lần chạy đã chọn làm
  vậy, build và cài app, mở nó. Mỗi việc được ghi lại với lệnh và identifier của nó, và việc boot thì
  ghi thêm process ID, theo `## Process management`.
- **Bước 3, kiểm và assert.** Đi qua tiêu chí chấp nhận bằng device automation của harness, rồi assert
  side effect trong local stack đúng như hiện nay. Một luồng kết thúc bằng việc app nói đã thành công
  thì mới verify được thông báo, chưa verify được kết quả, như `ui-checks.md` vốn đã nói.
- **`--ui` trên device.** Các kích thước màn hình là các device mà design hay mục Compatibility nêu tên,
  thay cho ba độ rộng; khi không có cái nào được nêu, dùng một device của lần chạy, và report nói lựa
  chọn đó là của skill.
- **Dọn dẹp.** Chỉ tắt simulator hay emulator khi lần chạy này đã boot nó; để lại build đã cài và nói
  điều đó trong report. Không bao giờ gỡ cài đặt trên device thật.
- **Khi không có device automation.** Stack vẫn khởi động và các bước kiểm mức request vẫn chạy; report
  liệt kê từng tiêu chí của app là chưa được kiểm, kèm lý do, và không nêu việc dừng nào.
- **`verify/SKILL.md` vẫn dưới 300 dòng.** Các chỗ sửa thay chữ trong các dòng có sẵn ("real
  interaction" của phạm vi, "the browser" của quy tắc port); chi tiết đi vào
  `references/runtime-checks.md` và `references/ui-checks.md`.

### Output và record

Không artifact nào đổi hình dạng. Run record, triage report và run log giữ path và các trường của chúng
(`run-cases/SKILL.md:162-167`). `Environment` của record, với device, là:
`<build>, <row name>, <platform> <OS version> <device kind>, <account by role>`. `atk:qa --bug` và
`atk:qa --retest` đọc nó mà không phải đổi gì, đáp ứng AC4. Report của `verify` có thêm device, build,
và những gì đã được boot và cài, dưới các dòng process management hiện có.

### Các file thay đổi

| File | Thay đổi |
|------|--------|
| `plugins/atk/shared/host-capabilities.md` | Mục Device automation; ngoại lệ ở các dòng 109-114 và 131-138 được viết lại theo client; dòng trích dẫn ở dòng 13 |
| `plugins/atk/shared/device-sessions.md` | Mới (R1): app session, trạng thái sạch, thứ tự các assertion, device thật, bước kiểm status bar |
| `plugins/atk/shared/project-profile.md` | Dòng `App` trong hàng Verify ở dòng 191 (R1) |
| `plugins/atk/skills/run-cases/SKILL.md` | Description và trigger bằng tiếng Anh, tiếng Việt và tiếng Nhật ("run test cases on the mobile app", "chạy test case trên app mobile", "モバイルアプリでテストケース実行"); phần mở đầu; Scope; bước 1 kiểm automation mà client cần; bước 2 chốt client; bước 5 và 7 và definition of done nói client, không nói browser. Vẫn dưới 300 dòng |
| `plugins/atk/skills/run-cases/references/triage.md` | Tiêu chí 2 và 6 theo từng client; cột `Platform` (Q3); recon qua session của client |
| `plugins/atk/skills/run-cases/references/execution.md` | The browser thành The client; `Environment` của defect theo từng client |
| `plugins/atk/skills/run-cases/references/environment-safety.md` | Client không phải target; bước kiểm build; cổng phải qua lại khi session của client bị reset |
| `plugins/atk/skills/run-cases/evals/trigger_evals.json` | Các mẫu dương cho lần chạy mobile bằng ba ngôn ngữ; một mẫu âm cho việc viết code end-to-end cho mobile |
| `plugins/atk/skills/verify/SKILL.md` | Chỉ sửa chữ trong dòng: phạm vi, client ở bước 1, quy tắc port; giữ ở mức 299 dòng hoặc ít hơn (R1) |
| `plugins/atk/skills/verify/references/runtime-checks.md` | Khởi động device, build và cài, bước kiểm chỉ-local cho build, dọn dẹp (R1) |
| `plugins/atk/skills/verify/references/ui-checks.md` | Kích thước màn hình trên device; tương tác qua device automation (R1) |
| `plugins/atk/skills/verify/references/report-template.md` | Device, build, và những gì đã được boot và cài (R1) |
| `plugins/atk/skills/verify/evals/trigger_evals.json` | Các mẫu dương cho việc verify một thay đổi trên app mobile bằng ba ngôn ngữ (R1) |
| `plugins/atk/skills/init/references/detection.md`, `profile-template.md` | Phát hiện và ghi dòng `App` (R1) |
| `plugins/atk/skills/qa/references/test-case-template.md` | Cột `Platform` tùy chọn, các giá trị của nó, và cách ánh xạ sang spreadsheet (Q3) |
| `README.md` | Đoạn về ngoại lệ ở các dòng 171-172 |
| `CLAUDE.md` | Các đoạn ở dòng 151-152, 217-218 và 301-308; bảng shared có thêm `device-sessions.md` và số đếm thành hai mươi hai; các hàng `host-capabilities.md` và `project-profile.md` |
| `docs/skills-overview.md`, `docs/vi/skills-overview.md` | Mục `run-cases` quanh dòng 717, và các mục `verify` và `qa` |
| `docs/system-architecture.md`, `docs/vi/system-architecture.md` | Các dòng 202-204, và lớp shared |
| `docs/codebase-summary.md`, `docs/vi/codebase-summary.md` | Một hàng cho `shared/device-sessions.md` |

Số skill, các manifest và các file marketplace không đổi.

### Mô hình dữ liệu và migration

Bảng case có thêm cột `Platform` tùy chọn (Q3). Một file case không có cột này được đọc là mọi
platform, nên không file nào viết trước thay đổi cần sửa. Profile có thêm dòng `App` tùy chọn (R1), và
profile không có dòng đó hoạt động như hiện nay. Không record nào đổi hình dạng.

### Hợp đồng API

N/A. Kit không có API. Các hợp đồng quan trọng là hình dạng của run record, vốn không đổi, và hai
trường tùy chọn ở trên.

### Lỗi và trường hợp biên

- Không có device automation, hoặc có nhưng không điều khiển được platform hay loại device đã chọn:
  `run-cases` dừng sau câu hỏi phạm vi, như khi không có browser automation hiện nay; `verify` chạy
  không có app và nói điều đó.
- Không có device nào kết nối, hoặc app chưa được cài: `run-cases` dừng ở bước 2 và nêu cái còn thiếu;
  `verify` boot, build và cài như trên, hoặc dừng ở bước đầu tiên thất bại, như một lần khởi động thất
  bại làm dừng nó hiện nay.
- Backend của build không khớp với target: dừng trước mọi lần đăng nhập hay request, nêu tên owner của
  dòng với `run-cases` và người phụ trách môi trường với `verify`.
- Device bị khóa hoặc app crash giữa case: case chưa giải quyết được trong round đó, crash được ghi là
  một finding kèm các bước dẫn tới nó, và app được mở lại.
- Một dialog hệ thống mà case không nêu, một yêu cầu cấp quyền hay một lời nhắc cập nhật: được ghi lại
  và chỉ đóng khi case nói phải trả lời gì; nếu không thì case chưa giải quyết được.

### Tương thích ngược

Một lần chạy `run-cases` không nêu device là một lần chạy browser, từng bước một, và điểm triage của
nó không đổi. Một lần chạy `verify` trên profile không có dòng `App` là lần chạy như hiện nay. Một file
case không có cột `Platform` được đọc là mọi platform. AC5 được giữ. Các override viết cho một trong
hai skill vẫn áp dụng; một override nhắc tới browser được đọc là client browser.

### Feature flag hoặc triển khai

Một spike có giới hạn thời gian chạy trước khi triển khai (Q1), qua `atk:design-doc --spike`, trên
Claude Code với một device automation trên một iOS simulator, một Android emulator và một device thật
(Q2). Nó ghi lại automation có lộ ra accessibility hierarchy, dialog hệ thống, build number, network
traffic, việc xóa dữ liệu, và việc cài và mở một build local hay không; Cursor và Codex được nêu theo
tài liệu của chúng, như ADR 0009 đã làm. Record của nó được link từ design này, và các phát hiện của nó
sửa lại bảng triage và thứ tự các assertion trước khi `atk:plan` sắp xếp công việc. Giới hạn thời gian
là một ngày làm việc, khoảng tám giờ, do Lam Ngoc Khuong đặt (Q4): khoảng hai giờ để chuẩn bị iOS
simulator, Android emulator và device thật, khoảng một tiếng rưỡi cho mỗi loại device để làm sáu bước
kiểm, và khoảng một tiếng rưỡi cho record. Một loại device có phần chuẩn bị vượt quá hai giờ được ghi
là chưa đo, và spike chuyển sang phần tiếp theo.

Spike record: `docs/records/design/261025-2201-spike-device-automation.md`, viết ngày 2026-10-25. Các
đề xuất của nó chưa được áp vào design này: chúng đi vào qua `--answer`, theo quyết định của Tech
Lead. U1 và Q5 đã được quyết, và mọi đề xuất đều được nhận.

Phiên bản đầu là Android, trên emulator hoặc device thật, được đo trên Claude Code (R2). iOS
simulator và device iOS được hoãn sang issue #155 (U2 của spike, và U3 cho iOS), và việc chạy probe
của spike trên Cursor và Codex sang issue #156 (U4). Chữ của skill vẫn trung lập với harness, vì
device automation được xác định vào lúc dùng; thứ phải chờ là việc đo, và
`docs/system-architecture.md` nêu Claude Code là harness duy nhất đã được đo cho tới khi #156 đóng.
Device Android thật, chưa được spike đo (U3), vẫn ở trong phiên bản đầu và được đo trong lúc triển
khai.

Không có flag. Client device có từ bản phát hành đưa nó vào, và chỉ được dùng khi người chạy chọn nó
hoặc khi thay đổi chạm tới app.

### Quay lui

Revert thay đổi. Các record và report do lần chạy trên device ghi vẫn hợp lệ, vì hình dạng của chúng là
hình dạng của lần chạy browser; một cột `Platform` hay một dòng `App` còn lại trong dự án sẽ bị bản kit
cũ bỏ qua.

### Khả năng quan sát

Run log của `run-cases` và report của `verify` ghi client, platform, phiên bản OS, loại device, build,
nguồn của version của build và của bước kiểm backend của nó (repository, lệnh của profile, hay xác
nhận của người chạy), và device ID của automation cạnh serial của platform (Q5). Run trace không cần
loại event mới: client là giá trị của một cờ hoặc câu trả lời cho một gate.

### Ảnh hưởng tới bảo mật và quyền

- Device automation làm được mọi thứ một bàn tay trên device làm được. Device thật chỉ được dùng khi
  người chạy nêu tên nó và nói nó chỉ chứa tài khoản test (Q2).
- Screenshot trên device có thể hiện thông báo của app khác và các tài khoản đang đăng nhập; bước kiểm
  status bar bao điều đó, và không gì được link khi chưa có xác nhận của người chạy.
- Credential và mã dùng một lần theo `environment-safety.md`, Credentials, không đổi: được hỏi trong
  phiên hoặc do người chạy gõ trên device, không bao giờ được ghi lại.
- `run-cases` không bao giờ cài build, nên nó không cần signing identity. Lệnh duy nhất nó chạy trên
  một device là lệnh xóa dữ liệu của profile, trên một emulator mà người chạy đã xác nhận (U1). `verify` build bằng lệnh riêng
  của dự án, lệnh này có thể dùng signing identity của developer trên device thật; lệnh đến từ profile,
  không bao giờ từ skill (R1).

### Kỳ vọng về hiệu năng

Một bước trên device chậm hơn một bước trên browser, thường chậm vài giây mỗi lần chạm trên emulator,
và việc build và boot của `verify` có thể mất vài phút. Các trần ba round và việc dừng khi hết chỗ trong
phiên ở bước 6 của `run-cases` giữ nguyên; mỗi phiên trên device sẽ hoãn nhiều case hơn, và record liệt
kê chúng như hiện nay.

## Câu hỏi mở

Không còn câu nào.

### Đã trả lời

| Câu hỏi | Câu trả lời | Người trả lời | Ngày | Người chuyển lời |
|---|---|---|---|---|
| Q1. Có nên chạy một spike có giới hạn thời gian (`atk:design-doc --spike`) trước khi triển khai, trên Claude Code với một device automation trên một iOS simulator và một Android emulator, để xác nhận nó lộ ra những gì không? | "Có" | Lam Ngoc Khuong | 2026-10-25 | |
| Q2. Device thật có trong phiên bản đầu không, hay chỉ simulator và emulator? | "Có" | Lam Ngoc Khuong | 2026-10-25 | |
| Q3. Template case của `atk:qa` có nên thêm cột `Platform` tùy chọn, để một case viết cho một platform được bỏ qua trên platform kia thay vì thành `BLOCKED` không? | "Có" | Lam Ngoc Khuong | 2026-10-25 | |
| R1. Yêu cầu review: "Tôi cũng cần verify có thể test được mobile app" | Tech Lead quyết định đây là một yêu cầu: `atk:verify` nằm trong phạm vi. Được ghi thành AC6, Quyết định 2 và `atk:verify` trên device | Lam Ngoc Khuong | 2026-10-25 | |
| Q4. Spike mà Q1 yêu cầu có giới hạn thời gian bao lâu? (Mở ra từ câu trả lời của Q1.) | "1 ngày làm việc (Recommended)", chọn phương án đầu trong ba phương án được đưa ra trong phiên: một ngày làm việc, nửa ngày không có device thật, hoặc hai ngày có đo cả Cursor và Codex | Lam Ngoc Khuong | 2026-10-25 | |
| U1 (spike record). `run-cases` có được xóa dữ liệu app của emulator hay simulator bằng lệnh của platform không, hay chỉ mở lại app? | Đầu tiên "Hãy cho tôi đề xuất phù hợp", rồi "Xoá bằng lệnh trong profile (Recommended)", chọn phương án đầu trong ba phương án được đưa ra trong phiên: xóa bằng lệnh của dòng `App` trong profile, trên emulator hay simulator mà người chạy đã xác nhận, không bao giờ trên device thật; chỉ mở lại app; gỡ và cài lại qua automation | Lam Ngoc Khuong | 2026-10-25 | |
| R2. Yêu cầu review, về U2 tới U4 của spike: "Sẽ hỗ trợ iOS và Cursor, Codex sau (có thể tạo ticket để nhắc nhở)" | Tech Lead quyết định: iOS, Cursor và Codex được hoãn. Sau đó "2 issue, Android thật giữ ở v1 (Recommended)": issue #155 cho iOS, issue #156 cho Cursor và Codex, device Android thật được giữ trong phiên bản đầu | Lam Ngoc Khuong | 2026-10-25 | |
| Q5. Design này có nhận các đề xuất khác của spike không: (1) bỏ log của app khỏi thứ tự các assertion và chấm 0 cho status và body của một request trên device; (2, nửa sau) đọc version của build bằng lệnh của platform khi màn hình không hiển thị nó; (3) áp bước kiểm status bar cho cả danh sách element lẫn screenshot; (4) nêu một trường không có tên là một finding của grounding; (5) ghi device ID của automation cạnh serial của platform? Mỗi đề xuất có thể được nhận hay bỏ riêng. (Mở ra từ spike record, 2026-10-25.) | "Đồng ý cả 5", sau khi hỏi đề xuất tốt nhất và được đưa ra một đề xuất cho mỗi khuyến nghị trong phiên: nhận cả năm, với lệnh version nằm trong dòng `App` của profile như U1 đã đặt lệnh xóa ở đó | Lam Ngoc Khuong | 2026-10-25 | |

ADR: `docs/adr/0011-run-cases-drives-a-device-as-a-second-client.md`
