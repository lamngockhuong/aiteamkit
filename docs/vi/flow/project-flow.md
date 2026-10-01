# Luồng dự án

24 skill rơi vào chu trình bàn giao của một đội như thế nào: skill nào thuộc pha nào, ai viết ra
artifact của nó, và ai phải chấp nhận artifact đó trước khi pha sau bắt đầu.

Tài liệu đi kèm: [skill-chain.md](./skill-chain.md) cho biết mỗi skill ăn vào gì và đẻ ra gì,
[skill-lifecycle.md](./skill-lifecycle.md) cho biết một skill chạy ra sao và khi nào nó với sang
skill khác, [../skills-overview.md](../skills-overview.md) cho biết khi nào nên dùng một skill và
khi nào không.

Các vai trò lấy từ `plugins/atk/shared/team-roles.md`: PM, BrSE/BA, TL, Dev, QA, SRE và Stakeholder. Đội nhỏ thì
một người gánh vài vai; lý do vẫn tách tên ra là vì người viết artifact và người duyệt nó là hai
dòng riêng, kể cả khi hai dòng đó trỏ về cùng một khuôn mặt.

## Toàn cảnh các pha

```mermaid
flowchart TD
    P0["0. Thiết lập<br/><small>một lần cho mỗi dự án</small>"] --> P1["1. Yêu cầu"]
    P1 --> P2["2. Ước lượng"]
    P2 --> P3["3. Thiết kế"]
    P3 --> P4["4. Chia việc và xếp thứ tự"]
    P4 --> P5["5. Làm"]
    P5 --> P6["6. Kiểm thử"]
    P6 --> P7["7. Phát hành"]
    P7 --> P8["8. Vận hành và rút kinh nghiệm"]
    P8 -.-> NC["Chu kỳ sau<br/><small>bắt đầu lại từ 1. Yêu cầu</small>"]
```

## Chi tiết chu trình

Mỗi hình thoi là một người chấp nhận hoặc trả lại artifact, không bao giờ là một skill tự quyết.
Artifact bị trả về tay người viết, và đó là vòng lặp được vẽ ở mỗi pha.

```mermaid
flowchart TD
    subgraph S0["0. Thiết lập"]
        I0["atk:init<br/><small>Dev hoặc TL soạn</small>"] --> I1[".atk/profile.md ở DRAFT<br/><small>được commit, trừ khi gốc dự án không thuộc repository nào</small>"]
        I1 --> IA{"TL duyệt<br/>profile"}
        IA -->|Yêu cầu sửa| I0
        IA -->|Đã duyệt| IP["Profile APPROVED"]
        I1 --> I2["atk:tailor<br/><small>không bắt buộc, TL hoặc vai sở hữu</small>"]
        I2 --> I3["Đã commit .atk/overrides/&lt;skill&gt;.md"]
        I3 --> IB{"Người duyệt<br/>ghi trong file duyệt"}
        IB -->|Yêu cầu sửa| I2
        IB -->|Đã duyệt| IO["Override APPROVED,<br/>áp dụng từ lần chạy sau"]
    end

    subgraph S1["1. Yêu cầu"]
        R0["atk:intake<br/><small>BrSE/BA soạn</small>"] --> R1{"Stakeholder<br/>chấp nhận phạm vi"}
        R1 -->|Còn câu hỏi bỏ ngỏ| R0
        R1 -->|Đã chấp nhận| R2["atk:catchup<br/><small>cho người vào sau</small>"]
    end

    subgraph S2["2. Ước lượng"]
        E0["atk:estimate<br/><small>Dev hoặc TL ước lượng, PM soát năng lực</small>"] --> E1{"PM và Stakeholder<br/>chốt sprint"}
        E1 -->|Phạm vi không vừa| R0
        E1 -->|Đã chốt| E2["Backlog của sprint"]
    end

    subgraph S3["3. Thiết kế"]
        D0{"Có đụng schema, hợp đồng công khai,<br/>module dùng chung hay hai service?"}
        D0 -->|Không| N0["Nhảy sang pha 4"]
        D0 -->|Có| D1["atk:design-doc<br/><small>TL hoặc Dev soạn, ghi ADR</small>"]
        D1 --> D2{"TL duyệt"}
        D2 -->|Yêu cầu sửa| D1
        D3["atk:spec<br/><small>vùng này hiện làm gì, hoặc đã thống nhất làm gì</small>"]
    end

    subgraph S4["4. Chia việc và xếp thứ tự"]
        B0{"Việc chia cho<br/>nhiều người?"}
        B0 -->|Có| B1["atk:breakdown<br/><small>chủ sở hữu, làn song song, phụ thuộc</small>"]
        B0 -->|Không| B2["atk:plan<br/><small>pha và bước cho một người</small>"]
        B1 --> B2
        C0["atk:convention<br/><small>một lần, rồi đồng bộ lại khi code đi xa</small>"]
    end

    subgraph S5["5. Làm"]
        M0["atk:implement<br/><small>Dev</small>"] --> MV["atk:verify<br/><small>Dev chạy thật hệ thống trước khi review</small>"]
        MV -->|Phát hiện lỗi| M0
        MV -->|Chạy đúng| MG["atk:git<br/><small>commit, push, pull request</small>"]
        MG --> M1["atk:review<br/><small>người review không bao giờ là tác giả</small>"]
        M1 -->|Có lỗi chặn| M0
        M1 -->|Đã duyệt| M2["Đã merge<br/><small>atk:git, gọi đúng số PR</small>"]
    end

    subgraph S6["6. Kiểm thử"]
        V0["atk:qa<br/><small>QA viết kế hoạch và test case</small>"] --> V1["Tester chạy các case<br/><small>ghi lại bằng atk:qa --record</small>"]
        V0 --> VR["atk:run-cases<br/><small>agent chạy các case tự động được trên DEV hoặc staging</small>"]
        V1 --> V2{"QA ký nhận"}
        VR --> V2
        VR -->|MANUAL, BLOCKED, bị hoãn| V1
        V2 -->|Phát hiện lỗi| F0["atk:fix"]
        F0 --> V1
    end

    subgraph S7["7. Phát hành"]
        L0["atk:release<br/><small>ghi chú, checklist, đường lui</small>"] --> L1{"Stakeholder hoặc PM<br/>cho phép phát hành"}
        L1 -->|Chưa| L0
        L1 -->|Đồng ý| L2["SRE triển khai"]
    end

    subgraph S8["8. Vận hành và rút kinh nghiệm"]
        O0["atk:incident<br/><small>khi production hỏng</small>"]
        O1["atk:retro<br/><small>cuối sprint hoặc cuối pha</small>"]
    end

    I1 --> R0
    R2 --> E0
    E2 --> D0
    N0 --> B0
    D2 -->|Đã duyệt| B0
    C0 --> M0
    D0 -->|Có| D3
    M2 -.->|Hợp đồng thay đổi| D3
    D1 -.->|Contract: first, spec --from| D3
    B2 --> M0
    M2 --> V0
    V2 -->|Đạt| L0
    SC["atk:security<br/><small>nằm ngoài chu trình</small>"] -.->|Tùy chọn, trước khi phát hành:<br/>checklist đọc record của nó| L0
    L2 -.->|Tùy chọn, sau khi triển khai| SC
    L2 --> O0
    L2 --> O1
    O1 -.->|Hành động chảy sang chu kỳ sau| R0
```

## Tra cứu theo pha

| Pha | Skill | Người viết | Người chấp nhận | Trạng thái artifact tại cửa duyệt |
|-----|-------|------------|-----------------|------------------------------------|
| 0. Thiết lập | `atk:init` | Dev hoặc TL, PM lo phần tracker và đội | TL, trước khi profile thôi là bản nháp; trong lúc chờ, các skill nó mở khóa vẫn chạy | `DRAFT` sang `APPROVED`, được commit ở `DRAFT` trừ khi hình dạng `workspace` không có repository nào để commit vào |
| 0. Thiết lập | `atk:tailor` | TL, hoặc ai sở hữu thứ skill đó sinh ra | Vai sở hữu kết quả của skill được tùy biến | `IN REVIEW` sang `APPROVED` |
| 1. Yêu cầu | `atk:intake` | BrSE/BA | Stakeholder, về phạm vi và tiêu chí | `IN REVIEW` sang `APPROVED` |
| 1. Yêu cầu | `atk:catchup` | Người mới vào việc | Không ai; phần kiểm tra hiểu bài là tự chấm | `DRAFT` |
| 2. Ước lượng | `atk:estimate` | Dev hoặc TL lo kích thước, PM soát năng lực | PM và Stakeholder cùng chốt | `DRAFT` khi còn thiếu số liệu capacity, rồi `IN REVIEW` sang `APPROVED` |
| 3. Thiết kế | `atk:design-doc` | TL hoặc Dev | TL, người nắm quyết định kỹ thuật cuối | `IN REVIEW` sang `APPROVED` |
| 3. Thiết kế | `atk:spec` | Dev, và BrSE/BA với loại `screen` | TL với loại `api` và `db`, BrSE/BA với loại `feature` và `screen` | `IN REVIEW` sang `APPROVED`, sau đó ghi đè tại chỗ mãi mãi |
| 4. Chia việc | `atk:breakdown` | TL hoặc PM | Từng Dev nhận phần việc của mình | `IN REVIEW` sang `APPROVED` |
| 4. Xếp thứ tự | `atk:plan` | Dev | Chính tác giả, trừ khi cửa kiểm tra đẩy lên TL | `DRAFT` |
| 4. Quy ước | `atk:convention` | TL | Cả đội đồng thuận, ghi theo từng quy tắc | `IN REVIEW` sang `APPROVED` |
| 5. Làm | `atk:implement` | Dev | Người review thay đổi, qua `atk:review` | không có |
| 5. Làm | `atk:verify` | Dev | Người review thay đổi, trước khi duyệt nó | `IN REVIEW` sang `APPROVED` |
| 5. Làm | `atk:review` | Người review, không bao giờ là tác giả | TL, khi vòng lặp chạm trần | không có |
| 5. Làm | `atk:git` | Dev | Người review, người duyệt pull request mà nó mở | không có |
| 6. Kiểm thử | `atk:qa` | QA | QA Leader hoặc TL | `IN REVIEW` sang `APPROVED` |
| 6. Kiểm thử | `atk:qa --record`, `--retest` | QA đã chạy các case | QA Leader hoặc TL | `IN REVIEW` sang `APPROVED` |
| 6. Kiểm thử | `atk:run-cases` | QA đã khởi động lần chạy | QA Leader hoặc TL | `IN REVIEW` sang `APPROVED` |
| Bất cứ lúc nào: định kỳ, hoặc trước hay sau khi phát hành | `atk:security` | Dev hoặc TL | TL, hoặc người phụ trách bảo mật nếu đội có; mỗi phát hiện chưa sửa được PM hoặc Stakeholder chấp nhận | `IN REVIEW` sang `APPROVED` |
| 7. Phát hành | `atk:release` | PM cùng SRE | Stakeholder hoặc PM ra quyết định phát hành | `IN REVIEW` sang `APPROVED` |
| 8. Vận hành | `atk:incident` | Incident Commander | TL và PM, về các hành động tiếp theo | `IN REVIEW` sang `APPROVED` |
| 8. Rút kinh nghiệm | `atk:retro` | PM hoặc cả đội | Cả đội, về ba hành động chọn ra | `IN REVIEW` sang `APPROVED` |

## Tra cứu theo vai

Bảng ghi mỗi vai viết gì, chấp nhận gì và đọc lại ở đâu được `atk:init` đọc khi đề xuất cột
`Approves` của profile, nên nó nằm trong kit, ở
[`plugins/atk/skills/init/references/role-defaults.md`](../../../plugins/atk/skills/init/references/role-defaults.md),
và viết bằng tiếng Anh. Các cột của bảng được gom từ mục `## Roles` của từng skill.

## Nằm ngoài chu trình

Bốn skill đáp lại một sự kiện chứ không thuộc pha nào, và một skill đáp lại một câu hỏi. Cả năm đều có
thể chạy ở bất kỳ điểm nào bên trên.

```mermaid
flowchart LR
    X1["Có báo lỗi"] --> X2["atk:fix<br/><small>chứng minh nguyên nhân trước khi sửa một dòng</small>"]
    X3["Có người vào đội"] --> X4["atk:onboard<br/><small>tuần đầu kết thúc bằng đóng góp của vai trò</small>"]
    X5["Có người rời đi,<br/>hoặc một pha khép lại"] --> X6["atk:handover<br/><small>người nhận kiểm lại rồi mới ký</small>"]
    X7["Không chắc bước<br/>tiếp theo là gì"] --> X8["atk:help<br/><small>đọc dự án, gọi tên một skill</small>"]
    X9["Đến kỳ rà soát bảo mật"] --> X10["atk:security<br/><small>quét codebase hiện tại</small>"]
```

`atk:help` không có cửa kiểm soát và không có người duyệt, vì nó không viết artifact nào. Thay vào
đó nó đọc các cửa kiểm soát bên trên: một artifact còn ở `IN REVIEW` được báo là đang chờ người duyệt
của nó, không bao giờ được báo là đã sẵn sàng cho pha kế tiếp.

`atk:fix` là skill duy nhất thò tay ngược vào chu trình: lỗi bắt ở pha 6 thì sửa xong quay lại pha 6,
còn lỗi lộ ra sau khi phát hành thì mở thẳng pha 8.

`atk:security` không phải bước mà mọi thay đổi đều đi qua. Đội chạy nó định kỳ trên codebase hiện
tại, và có thể chạy thêm quanh một lần phát hành: trước một bản phát hành chạm tới xác thực, dữ liệu
cá nhân, thanh toán hay một tích hợp bên ngoài, khi đó `atk:release` đọc record của nó lúc soạn
checklist; và sau khi triển khai. Đó là hai cạnh nét đứt trong sơ đồ chu trình, đi vào bước phát hành
của pha 7 và đi ra từ lần triển khai, và cả hai đều là tùy chọn. Phát hiện nào nó để lại cần sửa
thì đi sang `atk:fix` như mọi lỗi khác.

`atk:git` vẽ ở pha 5 vì đó là nơi phần lớn công việc đi tới một pull request, nhưng nó không gắn với
pha nào. Mọi skill làm xong việc đều giao lại cho nó, nên một artifact viết ở pha 1 và một bản vá làm
ở pha 8 đều đóng lại theo cùng một đường.

`atk:spec` vẽ ở pha 3 vì đó là lúc một đội lần đầu viết ra vùng này làm gì, nhưng cạnh nét đứt đi từ
chỗ merge mới là cạnh chạy thường xuyên nhất. Thay đổi nào đụng tới hợp đồng thì mang theo tài liệu
tham chiếu trong cùng pull request, theo `plugins/atk/shared/spec-docs.md`, và đó là lý do tài liệu sống lâu hơn
cái pha sinh ra nó. Khi `Contract: first`, pha 3 cũng là lúc tài liệu được viết từ thiết kế ngay khi
thiết kế đang được review, nên contract và quyết định được review cùng nhau, và các pha sau làm theo
cùng một trang.

## Những gì luồng này không quy định

Nó không định độ dài sprint, chiến lược nhánh, hay tên cụ thể của người duyệt. Đó là quyết định của
đội, và kit chỉ ghi lại chứ không chọn thay: người duyệt theo từng loại artifact nằm trong
`.atk/profile.md` (xem `plugins/atk/shared/project-profile.md`), còn quy tắc nhánh và commit là bất cứ thứ gì
`atk:convention` tìm thấy trong repo.
