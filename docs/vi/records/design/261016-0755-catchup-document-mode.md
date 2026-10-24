---
title: atk:catchup giải thích một tài liệu bằng lời dễ hiểu, dù là record của kit hay tài liệu nào khác
status: SUPERSEDED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-24
ticket: none
---

Bị thay thế ngày 2026-10-24 bởi `docs/records/design/261023-1609-review-findings-explained-and-answered.md`, design đổi một quyết định, rằng mọi điều trang nói đều truy được về một chỗ trong tài liệu, với review report; mọi quyết định khác ở đây vẫn giữ nguyên.

# atk:catchup giải thích một tài liệu bằng lời dễ hiểu, dù là record của kit hay tài liệu nào khác

Bản tiếng Việt để đọc cho tiện. Bản gốc là `docs/records/design/261016-0755-catchup-document-mode.md`; khi hai bản khác nhau, bản
tiếng Anh là bản đúng.

## Tóm tắt

Ngày 2026-10-16, một lần chạy `atk:security` trên repository này ghi ra một record gồm 13 finding.
Mọi nhận định trong đó đều đi kèm một trích dẫn `path:line`, và người bảo trì yêu cầu "an
explanation of every finding that is easy to understand, in a file I can read". Phiên làm việc hôm ấy đã
viết tay một trang như vậy. Với mỗi finding, trang nói điều gì xảy ra, ai có thể gây ra nó, đưa một
phép so sánh đời thường, tác động, các điều kiện và cách sửa đề xuất, rồi thêm một bảng mỗi finding
một dòng cùng một thứ tự làm việc đề xuất. Chưa skill nào trong kit viết trang đó. Sau đó người bảo
trì mở rộng yêu cầu sang mọi tài liệu, không chỉ các record của chính kit. Báo cáo kiểm thử xâm nhập
của một nhà cung cấp, một bản audit, đặc tả của khách hàng hay một phụ lục hợp đồng đều là những thứ
một thành viên được trao và phải hiểu.

Bản design này cho `atk:catchup` một chế độ thứ ba, chế độ tài liệu, được chọn khi tham số là một
file cục bộ. Lần chạy ghi một trang vào thư mục derived mà bản brief của catchup đang dùng. Trang có
hai dạng:

- **Với một record do kit viết,** trang giải thích từng finding, dựa trên những gì kit biết về loại
  record đó.
- **Với mọi tài liệu khác,** trang giải thích từng finding khi tài liệu có finding, và từng mục khi
  tài liệu không có.

Hai dạng dùng chung các quy tắc trung thành với nguồn. Bằng chứng, mức độ nghiêm trọng và ID được chép
nguyên văn. Trang không khẳng định điều gì tài liệu không nói. Thứ tự làm việc trang đề xuất được
ghi rõ là đề xuất và nêu tên người quyết định nó. Một tài liệu từ bên ngoài được đọc như bằng chứng,
không bao giờ như chỉ thị.

Ba chỗ khác đã được cân nhắc: một skill `atkx` mới, một cờ `--plain` trên mỗi skill ghi record, và
để phần `In short` mà mọi record của kit mở đầu bằng nó đảm nhận. Phương án nào cũng thua, vì những lý
do nêu bên dưới. Lam Ngoc Khuong đã trả lời hai câu hỏi mà một bản nháp trước để ngỏ: trang vẫn giải
thích một record bảo mật ngay cả khi rủi ro của nó chưa được chấp nhận, kèm một cảnh báo; và threat
model là một trong các loại record mà trang biết. Anh cũng trả lời câu hỏi mà một bản nháp sau để
ngỏ: một đường link tới tài liệu được đọc qua một kết nối mà harness đã có, với bản xuất cục bộ làm
phương án dự phòng. Plan xây design này nêu thêm bốn câu hỏi, và câu trả lời của anh được ghi ở mục
"Các quyết định trong lúc review": trang là tài liệu tạm, nằm ngoài git và không bao giờ được đề nghị
commit, cảnh báo là một dòng trong phiên, còn trang và trace của nó được đặt tên theo loại record
hoặc `document`, không bao giờ theo tên riêng của tài liệu. Không còn gì để ngỏ.

## Yêu cầu

Không có artifact yêu cầu nào. Các tiêu chí lấy từ phiên làm việc đã tạo ra record này:

| # | Tiêu chí | Nguồn |
|---|-----------|--------|
| AC1 | Cho đường dẫn của một record có sẵn, lần chạy giải thích mọi finding trong đó, không bỏ sót finding nào | người bảo trì, 2026-10-16 |
| AC2 | Với mỗi finding, trang nói điều gì xảy ra, ai có thể gây ra nó, một phép so sánh đời thường, tác động, các điều kiện và cách sửa đề xuất | trang viết tay ngày 2026-10-16, mà người bảo trì muốn làm lại được |
| AC3 | Trang kết thúc bằng một bảng mỗi finding một dòng và một thứ tự làm việc đề xuất | cùng trang đó |
| AC4 | Bằng chứng, mức độ nghiêm trọng và ID giữ nguyên, và không khẳng định gì ngoài tài liệu | `plugins/atk/shared/plain-writing.md`, "What does not change" |
| AC5 | Chế độ này nằm trong `atk:catchup`, không phải một skill mới | người bảo trì, 2026-10-16 |
| AC6 | Một đội chỉ cài `atk` vẫn có nó | `CLAUDE.md`, "The kit stands alone" |
| AC7 | Mọi tài liệu hay record mà kit không viết cũng được hỗ trợ | người bảo trì, 2026-10-16 |
| AC8 | Một record bảo mật có rủi ro chưa được chấp nhận vẫn được giải thích, kèm cảnh báo trước mọi commit | người bảo trì, trả lời một câu hỏi mở của bản nháp trước, 2026-10-16 |
| AC9 | Threat model của `atk:security --threat-model` là một loại đã biết | người bảo trì, cùng câu trả lời đó |
| AC10 | Một đường link tới tài liệu được đọc qua một kết nối mà harness có, và bản xuất cục bộ là phương án dự phòng | người bảo trì, trả lời câu hỏi mở của bản nháp sau, 2026-10-16 |

AC5 là lựa chọn của người bảo trì, đưa ra sau khi phiên làm việc đề xuất nó. Các phương án bên dưới vẫn
so sánh những lựa chọn khác, để ADR ghi lại vì sao chúng thua.

## Hiện trạng

- **Mọi record của kit đã mở đầu bằng một bản tóm tắt dễ hiểu.** `plugins/atk/shared/plain-writing.md`
  được trích dẫn bởi các mẫu báo cáo của `fix`, `verify`, `review`, `security` và `qa --record`, bởi
  `run-cases` qua cùng hình dạng run record, và bởi `## Output` của `incident`. File đó đòi một mục
  `In short` dài ba đến sáu câu, rồi năm quy tắc cho phần văn xuôi quanh bằng chứng. Mục đó tóm tắt cả
  lần chạy. Nó không giải thích từng finding, và mỗi khối finding vẫn viết cho người đọc sẽ mở các
  trích dẫn. Record bảo mật ngày 2026-10-16 là một ví dụ: mục `In short` của nó dài tám câu, và mỗi
  khối trong 13 khối finding là một bảng gồm các ô `path:line`. Một tài liệu từ ngoài kit thì hoàn
  toàn không có mục như vậy.
- **`--lang` dịch chứ không làm dễ hiểu hơn.** Mọi skill ghi tài liệu đều nhận `--lang <code>`. Một
  record bảo mật tiếng Việt cũng nặng kỹ thuật như bản tiếng Anh.
- **`atk:catchup` là skill dành cho người đọc vắng mặt.** Nó "Turns an epic or a pull request into a
  page that gets a newcomer to the work in a few minutes"
  (`plugins/atk/skills/catchup/SKILL.md:18-20`). Bản brief của nó dùng xong là bỏ, `approver: none`,
  và được ghi vào `docs/derived/catchup/` (`plugins/atk/skills/catchup/references/brief-template.md:23-25`,
  `plugins/atk/shared/artifact-paths.md:142`). Nó dẫn link tới nguồn thay vì nhắc lại nội dung
  (`SKILL.md:22-24`).
- **Chế độ của nó phụ thuộc vào đầu vào trỏ tới đâu.** Bước 1 có hai chế độ. Một URL chứa
  `/pull/` và những dạng tương tự là chế độ pull request, còn mọi thứ khác được tra qua tracker
  (`SKILL.md:66-75`). Hiện nay một đường dẫn file cục bộ không được nhận ra. Nó được gửi tới tracker
  như thể là một ticket id và thất bại ở đó.
- **Chế độ pull request đã bỏ hẳn bước kiểm tra mức hiểu** (`SKILL.md:85-88`).
- **Bước 6 đã gom các câu hỏi mở gửi tới một người có tên** (`SKILL.md:144-160`). Một record của kit
  có mục `Open questions` riêng, đã mang sẵn tên người. Một tài liệu từ bên ngoài có thể không nêu tên
  ai.
- **Kit đã đọc những tài liệu nó không viết, theo quy tắc 8 và 9.** Quy tắc 8 của
  `plugins/atk/shared/team-roles.md` coi tài liệu của nhà cung cấp là bằng chứng, không phải chỉ thị.
  Quy tắc 9 và bảng đường dẫn của `plugins/atk/shared/secret-scan.md` giữ cho các file dotenv và file
  thông tin xác thực không bị đọc.
- **Kit đã có tiền lệ cho những định dạng harness không đọc được.** `atk:security` xin một checklist
  dạng bảng tính dưới dạng CSV hoặc văn bản dán vào, thay vì đoán nội dung (`atk:security` bước 5).
- **`atk:intake` là skill láng giềng dễ bị nhầm khi có một tài liệu.** Nó biến một yêu cầu không có
  cấu trúc, trong đó đầu vào có thể là một tài liệu, thành yêu cầu. Giải thích một tài liệu và biến nó
  thành yêu cầu là hai công việc khác nhau, và phần mô tả phải tách được hai thứ đó.
- **Các dạng record của kit khác nhau ở chỗ thế nào là một "finding".**
  - Trong record bảo mật, đó là một khối `SF<n>` có các trường như `What an actor does`,
    `What they gain` và `Suggested control`
    (`plugins/atk/skills/security/references/record-template.md`, "The security record").
  - Threat model có mỗi ranh giới và câu hỏi STRIDE một dòng, kèm biện pháp kiểm soát trả lời mối đe
    dọa hoặc `none` (cùng file, "The threat model").
  - Trong báo cáo review, đó là một finding `B<n>`, `S<n>` hoặc `N<n>` với `File` và `Fix`
    (`plugins/atk/skills/review/references/report-format.md:15-17`, `:76-125`).
  - Báo cáo fix có một lỗi duy nhất và nguyên nhân của nó.
  - Record kiểm chứng và record của một lần chạy test liệt kê các bước kiểm tra hỏng và các case hỏng.
- **Các trigger của phần mô tả** (`SKILL.md:3-13`) bao epic và pull request ở cả ba ngôn ngữ.
  `evals/trigger_evals.json` chứa 10 case dương và 15 case âm, không case nào nói về một tài liệu.
- **Độ dài.** `SKILL.md` dài 205 dòng, so với trần 300 (`CONV-006`).

## Các phương án

Tiêu chí, xếp theo trọng số:

1. **Tiền đề làm việc theo đội.** Trang không được quyết định điều gì thuộc về một vai trò, và không
   được tạo một artifact không ai sở hữu.
2. **Phạm vi tới được.** Một đội chỉ cài `atk` có nó hay không (AC6).
3. **Khớp với một phạm vi sẵn có.** Nó mở rộng công việc của một skill hay đặt ra công việc mới.
4. **Chi phí.** Số file phải sửa bây giờ, và nguy cơ lệch nhau về sau.
5. **Khả năng đảo ngược.**

### A. Một chế độ tài liệu trong `atk:catchup` (được chọn)

Một đường dẫn file cục bộ là chế độ tài liệu. Lần chạy ghi một trang dưới
`docs/derived/catchup/documents/` theo một file mới, `references/document-explainer.md`.

- **Tiền đề.** Đạt. Như bản brief, trang có `approver: none` và một owner, không quyết định gì, và gửi
  các câu hỏi mở về cho từng người có tên.
- **Phạm vi tới được.** Đạt, vì `catchup` nằm trong `atk`.
- **Khớp.** Sát. Công việc của skill là "for someone who was not in the conversation", và một tài liệu
  được trao cho một người chính là dấu vết của một cuộc trao đổi họ đã không có mặt.
- **Chi phí.** Một file reference mới, khoảng 35 dòng trong `SKILL.md`, nhóm file của quy tắc đổi cờ,
  các trigger case mới, cột consumes của `docs/flow/skill-chain.md` và bản đối ứng, và danh sách nơi
  trích dẫn của `plain-writing.md`.
- **Khả năng đảo ngược.** Cao: một commit, và các trang nó ghi là file derived, xóa đi an toàn.

### B. Một skill `atkx` mới, `explain`

- **Tiền đề.** Đạt chuẩn `atkx` trong `CLAUDE.md`: chạy không cần profile và không ghi thứ gì mà một
  đồng đội được nhờ review.
- **Phạm vi tới được.** Không đạt AC6. Một đội chỉ cài `atk` không có nó, và chỉ `atk:help` được trỏ
  sang đó (`CONV-011`).
- **Khớp.** Một slash command mới nằm cạnh `plain-writing.md`, file nằm trong `atk` và sẽ phải chép
  sang `atkx`, vì mỗi plugin mang theo mọi file nó đọc.
- **Chi phí.** Chín nhóm trong danh sách của `atkx`, cộng một dòng về harness được hỗ trợ.
- **Vì sao thua.** Nó tới được ít đội hơn, và nhân đôi các quy tắc viết dễ hiểu. Đây là lựa chọn mặc
  định khi phạm vi bao cả những tài liệu kit không viết, vì nghe giống một tiện ích, và nó là phương án
  thay thế được nêu tên trong phiên làm việc.

### C. Một cờ `--plain` trên mọi skill ghi record

- **Tiền đề.** Đạt.
- **Phạm vi tới được.** Đạt.
- **Khớp.** Kém. Phần giải thích sẽ được viết đúng lúc record được viết, tức là lúc người đọc cần nó
  không có mặt. Nó không đạt AC7 ngay từ đầu, vì không skill nào viết báo cáo của nhà cung cấp.
- **Chi phí.** Sáu skill, sáu cờ, và sáu bộ quy tắc `## Output` phải giữ giống nhau.
- **Vì sao thua.** Nó chỉ bao các record mới của kit, và rải một quy tắc ra sáu file.

### D. Không làm gì, dựa vào `In short`

- **Tiền đề.** Đạt.
- **Phạm vi tới được.** Đạt.
- **Khớp.** Đã phát hành, chỉ cho record của kit.
- **Chi phí.** Không có.
- **Vì sao thua.** Nó không đạt AC1 đến AC3 và AC7.

| Tiêu chí | A | B | C | D |
|-----------|---|---|---|---|
| Tiền đề làm việc theo đội | đạt | đạt | đạt | đạt |
| Phạm vi tới được (AC6) | đạt | không đạt | đạt | đạt |
| Khớp | sát | lệnh mới | sai thời điểm | một phần |
| Chi phí | thấp | trung bình | cao | không có |
| Khả năng đảo ngược | cao | cao | trung bình | n/a |
| AC1 đến AC3 | có | có | chỉ record mới | không |
| AC7 | có | có | không | không |

## Cách tiếp cận được chọn

### Chọn chế độ

Bước 1 gạt các cờ sang một bên, rồi kiểm tra một điều trước phép thử URL và lần tra tracker: đầu vào
có mở đầu bằng đường dẫn tới một file cục bộ đang tồn tại không? Nếu có, lần chạy ở chế độ tài liệu.
Nó áp danh sách những thứ lần chạy sẽ không đọc, trong đó có quy tắc 9, trước khi đọc bất kỳ byte nào
của file, và chỉ sau đó mới chốt dạng:

- **Một record của kit.** File mang khối front matter chung của `shared/artifact-paths.md`, và thư
  mục cùng các heading của nó khớp một dòng trong bảng loại bên dưới. Dòng thông báo là "document
  mode: `<path>` is a `<kind>` record of the kit".
- **Mọi tài liệu khác.** Mọi thứ còn lại, kể cả một file của kit có loại không nằm trong bảng. Dòng
  thông báo là "document mode: `<path>`, not a record of the kit, explained as `<findings or
  sections>`", theo sau là điều đã chốt lựa chọn.

Một đường dẫn, một URL hay một ticket id chỉ được coi là nguồn khi nó mở đầu đầu vào, theo sau nhiều
nhất là một yêu cầu ngắn; đầu vào nhiều dòng, hoặc nằm trong dấu trích dẫn, là văn bản dán vào. Một
thư mục, hoặc một đường dẫn không tồn tại, thì được hỏi lại và không bao giờ gửi tới tracker. Một URL
pull request vẫn là chế độ pull request như trước. Một ticket id, hoặc một URL trên host của tracker
đã phát hiện, đi tới tracker, và một tracker không phát hiện được hoặc không trả lời thì được báo ra,
không bao giờ bị coi là chế độ tài liệu. Văn bản dán vào được xử lý như mọi tài liệu khác, không tra
tracker, và thân trang ghi rằng nguồn là văn bản dán vào.

### Một đường link tới tài liệu

Một URL không phải pull request và không nằm trên host của tracker đã phát hiện là một đường link tới
tài liệu, không tra tracker; một URL của tracker mà đối tượng tracker trả về không phải issue cũng
không phải pull request cũng vậy. Bước phân loại không bao giờ tải một URL. Ví dụ là một trang trong
wiki, một file trong kho tài liệu, hoặc một mục trong ổ đĩa dùng chung. Chế độ tài liệu đọc nó qua một
kết nối mà harness đã có tới dịch vụ đó, theo dòng về kết nối của `shared/host-capabilities.md`. Lần
chạy không bao giờ tải URL theo cách nào khác.

- **Kết nối được tìm theo khả năng của nó: đọc một tài liệu qua đường link.** Không bao giờ tìm theo
  tên công cụ, vì tên đó khác nhau tùy harness và tùy cách kết nối được cài.
- **Kết nối ở một trong ba trạng thái**, được đọc theo cách `shared/design-sources.md` đọc kết nối
  Figma:
  - **Chưa cài:** không công cụ nào trong phiên đọc được dịch vụ đó.
  - **Đã cài, chưa đăng nhập:** lời gọi định danh hoặc một lần đọc thử thất bại với lỗi chưa đăng
    nhập, hoặc lần đọc thử trả về trang đăng nhập hay trang xin quyền truy cập.
  - **Sẵn sàng:** lời gọi định danh trả về một tài khoản, hoặc lần đọc thử trả về tài liệu.
- **Chỉ trạng thái sẵn sàng mới được đọc.** Ở hai trạng thái còn lại, lần chạy in một dòng nêu tên
  dịch vụ và bước người dùng cần làm, cài đặt hoặc đăng nhập, rồi chuyển sang đường cục bộ. Nó xin một
  lần bản xuất của tài liệu, rồi đọc bản đó như một file cục bộ. Không trạng thái nào làm dừng lần
  chạy.
- **Một lần đọc qua kết nối sẵn sàng mà trả về trang đăng nhập, trang xin quyền truy cập hay lỗi bị
  cấm là một lần đọc thất bại của mục đó,** không bao giờ là nội dung của nó, và sau đó là cùng phương
  án dự phòng.
- **Tài khoản mà lời gọi định danh trả về chỉ dùng để quyết định trạng thái.** Nó không bao giờ được
  ghi vào trang, vào trace hay vào ticket.
- **Đường link xuất hiện trong thân trang dưới dạng tên dịch vụ và tiêu đề tài liệu, không bao giờ
  dưới dạng URL,** để cả host nội bộ lẫn link chia sẻ đều không lọt vào trang.
- **Một tài liệu đọc qua kết nối vẫn là tài liệu từ bên ngoài,** với quy tắc 8, quy tắc 9 và các quy
  tắc về độ nhạy cảm bên dưới giữ nguyên.

Hiện nay ba trạng thái chỉ được viết cho Figma. Catchup sẽ là skill thứ hai cần chúng, nên phần triển
khai chuyển phần chung, gồm phép thử khả năng, ba trạng thái và quy tắc về tài khoản, vào mục kết nối
của `shared/host-capabilities.md`. Khi đó `shared/design-sources.md` trích dẫn mục đó và giữ những gì
riêng của Figma: dòng hướng dẫn cài, phương án dự phòng bằng hình ảnh, và các lượt đọc. Cách này làm
theo quy tắc trong `CLAUDE.md`: một quy tắc mà hai skill cần thì đặt vào `shared/`.

### Những gì lần chạy sẽ không đọc

- **Một đường dẫn nằm trong bảng Paths that are a finding on their own của `shared/secret-scan.md`.**
  Bảng đó bao gồm file dotenv, khóa, hoặc kho thông tin xác thực. Lần chạy từ chối nó, theo quy tắc 9,
  và xin một bản sao đã xóa các giá trị.
- **Một định dạng harness không đọc được**, như bảng tính hay file soạn thảo văn bản trên đa số
  harness. Lần chạy xin một bản xuất nó đọc được, PDF, Markdown, CSV hoặc văn bản thuần, thay vì đoán
  nội dung. Đây là làm theo tiền lệ của `atk:security`.
- **Một file nằm ngoài repository** chỉ được đọc qua công cụ file của chính harness, công cụ sẽ hỏi
  người dùng. Lần chạy không bao giờ đi theo một symbolic link mà người dùng không nêu tên.

### Thế nào là một finding, theo từng loại record của kit

`references/document-explainer.md` giữ một bảng: loại record, cách nhận ra nó, và thế nào được tính là
một finding trong đó. Nhận ra dựa trên thư mục của file dưới `<docs root>` và các heading của nó, không
bao giờ chỉ dựa vào tên file.

| Loại | Một finding là | Các trường trang đọc |
|------|--------------|-----------------------|
| Record bảo mật | mỗi khối `SF<n>` | Severity and verdict, Category, What an actor does, What they gain, Suggested control, Settled by |
| Threat model | mỗi dòng mối đe dọa, nhóm theo ranh giới | ranh giới, câu hỏi STRIDE, mối đe dọa, biện pháp kiểm soát hoặc `none` kèm ID của finding, Assumptions |
| Báo cáo review | mỗi `B<n>`, `S<n>`, `N<n>` | mục mức độ nghiêm trọng, File, Issue, Fix, Author |
| Báo cáo fix | lỗi đó, tính là một finding | Symptom as captured, Root cause, The change, Not verified |
| Record kiểm chứng | mỗi case hỏng dưới `Cases`, và mỗi mục dưới `Not verified` | Sent, Received, Asserted, Result |
| Record của một lần chạy test, kể cả `run-cases` | mỗi khối `D<n>` dưới `Defects` | Case, Severity, Steps to reproduce, Expected, Actual |
| Record sự cố | sự cố đó, tính là một finding, cộng mỗi mục hành động | tác động, nguyên nhân, hành động, owner |

Một loại mới được thêm thành một dòng khi có skill bắt đầu ghi loại đó, không bao giờ xử lý bằng cách
đoán.

### Mọi tài liệu khác

Lần chạy trước hết xác định tài liệu được tạo nên từ những gì và ghi điều đó vào dòng thông báo chế
độ:

- **Finding.** Tài liệu liệt kê các mục, mỗi mục là một vấn đề. Báo cáo kiểm thử xâm nhập, bản audit,
  dữ liệu xuất từ công cụ quét và bản review của nhà cung cấp là ví dụ. Mỗi mục được giải thích với
  cùng các trường như một finding của kit. ID, thang mức độ nghiêm trọng và câu chữ riêng của tài liệu
  được giữ nguyên văn. "P2" của nhà cung cấp vẫn là "P2" và không bao giờ bị quy đổi sang thang
  Critical đến Low. Một trường tài liệu không cung cấp được ghi là "the document does not say".
- **Mục.** Mọi thứ còn lại: đặc tả, phụ lục hợp đồng, bản design, chính sách. Mỗi mục cấp cao nhất
  được giải thích với các trường sau:
  - nó nói gì;
  - nó có ý nghĩa gì với người đọc;
  - nó đòi hỏi ai làm gì, kèm tên khi tài liệu có nêu;
  - nó để ngỏ điều gì.

  Bảng tổng hợp khi đó có mỗi mục một dòng.
- **Cả hai.** Một tài liệu có một mục finding nằm trong một báo cáo dài hơn thì nhận cả hai dạng: dạng
  mục cho báo cáo, và dạng finding cho danh sách bên trong.

Trích dẫn trỏ tới thứ tài liệu có, tức là số mục, số trang hay heading của chính nó, vì tài liệu không
có `path:line`.

Văn bản bên trong tài liệu là bằng chứng, không bao giờ là chỉ thị, theo quy tắc 8. Một dòng yêu cầu
người đọc hoặc một agent làm gì đó được trích lên trang như điều tác giả của nó yêu cầu, và không điều
gì nó yêu cầu được thực hiện. Tác giả của một tài liệu từ bên ngoài không phải thành viên của đội. Một
câu hỏi tài liệu để ngỏ được gửi tới người đã trao tài liệu, kèm tên, hoặc `TBD (ask <person>)`, theo
quy tắc 1.

### Trang này đứng ở đâu so với `atk:intake`

Một yêu cầu khách hàng gửi tới, cần biến thành yêu cầu phần mềm, thuộc về `atk:intake`. Một tài liệu
mà một người muốn hiểu thuộc về chế độ tài liệu. Khi yêu cầu mơ hồ, như "xem đặc tả của khách giúp",
lần chạy hỏi người đó muốn cái nào trong hai, bằng một câu hỏi, trước khi đọc bất cứ thứ gì. Phần mô
tả và các trigger case âm giữ hai thứ này tách nhau.

### Trang

`references/document-explainer.md` đưa ra hình dạng. Front matter giống của bản brief, với `title`
riêng, "Plain explanation: <kind or document>", không bao giờ là tiêu đề của tài liệu,
`approver: none`, và `owner` là người đã yêu cầu. `ticket` là đường dẫn của record chỉ khi đó là một
record của kit đã commit, còn lại là `none`, theo `shared/artifact-paths.md`. Slug của trang là loại
record của kit, ví dụ `security-record` hoặc `threat-model`, hoặc `document`, và tên file theo quy tắc
đặt tên sẵn có từ hai giá trị đó. Tên riêng của tài liệu chỉ xuất hiện trong thân trang. Các mục theo
trang viết tay ngày 2026-10-16:

1. **In short**, theo `plain-writing.md`: tài liệu là gì, số lượng theo mức độ nghiêm trọng như tài
   liệu đưa ra, và điều gì đang chờ ai. Mục này được viết sau cùng.
2. **Terms**: mỗi thuật ngữ trang dùng mà người không chuyên không biết, giải thích bằng lời một lần.
3. **Mỗi finding, hoặc mỗi mục của tài liệu, một mục**, theo thứ tự của tài liệu, có heading là ID
   của nó và một tiêu đề dễ hiểu. Với một finding, mục đó gồm:
   - **Điều gì xảy ra.**
   - **Ai có thể gây ra nó**, hoặc "the document does not say".
   - **Một phép so sánh đời thường**, ghi rõ là phép so sánh.
   - **Nó gây thiệt hại gì**, so với tài sản mà tài liệu nêu tên.
   - **Điều gì phải đúng thì nó mới xảy ra.**
   - **Sửa thế nào**, theo đề xuất của tài liệu.
   - **Đã được kiểm tra chưa**, theo verdict hoặc trạng thái riêng của tài liệu.
4. **Bảng tổng hợp**: ID, một câu, mức độ nghiêm trọng, ai phải có mặt thì nó mới xảy ra, và bản sửa
   rơi vào đâu. Với mục, các cột là: mục, một câu, nó đòi hỏi ai làm gì.
5. **Thứ tự đề xuất**, chỉ cho finding, ghi rõ là đề xuất. Nó nhóm trước theo mức độ nghiêm trọng, sau
   theo file dùng chung, và kết thúc bằng tên người quyết định thứ tự: người phê duyệt record, hoặc
   người sở hữu độ ưu tiên theo quy tắc 3 của `shared/team-roles.md`.
6. **Waiting on**: các câu hỏi mở riêng của tài liệu kèm tên người, rồi những câu hỏi mà lần chạy thấy
   tài liệu để ngỏ, tổng cộng nhiều nhất mười dòng, như giới hạn bước 6 đã đặt.

### Quy tắc trung thành với nguồn

Các quy tắc này nằm trong `document-explainer.md` dưới một heading riêng, và chúng mở rộng "What does
not change" trong `plain-writing.md` thay vì nhắc lại nó:

- **Mọi nhận định trên trang đều truy được về một chỗ trong tài liệu.** Trang không chứa finding mới,
  mức độ nghiêm trọng mới hay verdict mới. Một trường tài liệu để trống được ghi là "the document does
  not say", không bao giờ điền bằng suy luận.
- **Phép so sánh là câu duy nhất tài liệu không có.** Nó được ghi rõ là phép so sánh, và không bao giờ
  làm thay đổi mức độ nghiêm trọng mà người đọc sẽ suy ra.
- **ID, tên mức độ nghiêm trọng, verdict và giá trị trạng thái giữ đúng như tài liệu viết,** kể cả khi
  đặt `--lang`, vì người đọc khác hoặc skill khác so khớp theo chúng.
- **Mỗi finding hoặc mục giữ một trích dẫn**, để người đọc muốn xem bằng chứng tìm được nó.
- **Không có từng bước khai thác.** Trang nói một kẻ tấn công làm gì ở đúng mức chi tiết của tài liệu,
  không bao giờ hơn. Một giá trị tài liệu cho thấy mà quy tắc 9 sẽ che thì được che trên trang, và
  trang ghi rằng nó đã che một thứ.

### Độ nhạy cảm

Trang thừa hưởng độ nhạy cảm của tài liệu nó giải thích. Ba trường hợp cần cảnh báo:

- một record bảo mật của kit có bảng rủi ro còn lại chứa một dòng chưa ai chấp nhận, hoặc có các
  finding `CONFIRMED` chưa sửa, hoặc một threat model có một dòng với biện pháp kiểm soát là `none`;
- một tài liệu từ bên ngoài được đánh dấu mật, hoặc có nêu tên một khách hàng;
- mọi tài liệu có một giá trị mà trang phải che.

Trong mỗi trường hợp, lần chạy giải thích tài liệu đầy đủ, và lúc kết thúc nói bằng một dòng, trong
phiên, vì sao trang nhạy cảm. Không có gì về điều đó được ghi vào trang. Trang là tài liệu tạm và
không bao giờ được đề nghị commit. Nó được ghi vào `docs/derived/catchup/documents/`, thư mục chứa một
file ignore với đúng một dòng `*`, tạo theo cách `shared/run-trace.md` tạo file ignore của trace và
được xác nhận bằng `git check-ignore -q` trên đường dẫn của trang, để trang nằm ngoài git ngay cả trong
một dự án commit `docs/derived/`. Khi `git check-ignore` thất bại, trang vẫn được ghi, và phiên nói
rằng trang không được giữ ngoài git cùng lý do; một đường dẫn thực nằm ngoài repository thì không ghi
gì. File ignore chỉ giữ trang khỏi git: một lần build docs hoặc một bản lưu trữ trên docs root vẫn đọc
nó, nên dòng thông báo trong phiên ghi "held out of git only". Một trang về một tài liệu từ bên ngoài
trong repository này cũng chịu `CONV-010`: nó không nêu tên khách hàng nào.

### Vai trò

- **Người đọc.** Bất kỳ ai phải hành động dựa trên một tài liệu họ không viết: một PM quyết định thứ
  tự công việc, một Stakeholder chấp nhận một rủi ro, một Dev mới vào mảng đó, hoặc chính người phê
  duyệt.
- **Owner.** Người đã yêu cầu trang.
- **Người phê duyệt.** Không có, như bản brief. Tài liệu mang sự phê duyệt nào nó có, và trang không
  thay đổi gì trong tài liệu.

### Mô hình dữ liệu và migration

N/A. Không có schema và không có trạng thái lưu trữ. Trang là một file Markdown.

### Hợp đồng API

N/A. Hợp đồng duy nhất là cách gọi. `argument-hint` trở thành
`"[epic-url|pr-url|file-path|doc-url] [--no-check] [--lang <code>] [--out <path>]"`. `--no-check` bị
bỏ qua ở chế độ tài liệu, vì chế độ này không có bước kiểm tra mức hiểu, và phiên nói rõ điều đó.

### Lỗi và trường hợp biên

- **Một tài liệu không có finding và không có mục**, như chỉ một đoạn văn. Trang gồm mục `In short`,
  mục Terms và mục Waiting on, và nói rõ như vậy.
- **Một record của kit có trạng thái `SUPERSEDED`.** Trang nêu tên record đã thay thế nó ở dòng đầu
  và hỏi có giải thích record kia thay không.
- **Một tài liệu dài hơn mức phiên có thể đọc trọn.** Mỗi finding hoặc mục được giải thích từ phần của
  riêng nó, và phần đọc rộng đi qua một agent, theo `shared/host-capabilities.md`, như bước 3 đã làm.
- **Một PDF quét không có lớp văn bản.** Lần chạy nói rằng nó không đọc được văn bản và xin một bản
  xuất dạng văn bản. Nó không bao giờ chép lại hình ảnh của một finding bằng cách đoán.

### Tương thích ngược

Chế độ epic và pull request không đổi. Một tham số là đường dẫn file cục bộ trước đây thất bại ở bước
tra tracker, giờ đi vào chế độ tài liệu. Không cách gọi nào đang chạy được bị đổi nghĩa.

### Triển khai

Một pull request mang chế độ này, file reference, các trigger case, và những file mà quy tắc đổi cờ
trong `CLAUDE.md` liệt kê. Không có feature flag.

### Hoàn tác

Revert commit. Các trang đã ghi là file derived, nằm ngoài git, và xóa đi an toàn, theo dòng Derived
của `shared/artifact-paths.md`.

### Khả năng quan sát

Run trace ghi chế độ và loại hoặc dạng trong dòng `step` đầu tiên. Trace được tạo trước khi biết loại.
Vì thế `subject` và slug của nó chỉ được tạo từ một ticket id, một số pull request hoặc khóa trong URL
tracker, khi đầu vào mở đầu bằng một trong ba thứ đó; với mọi đầu vào khác chúng là `document`, không
bao giờ là tên tài liệu, để tên file của khách hàng không bao giờ thành tên một trace. Một giá trị `--out` vẫn nằm trong
`flags` của trace như được đưa vào, vì người dùng đã chọn đường dẫn đó, và ở chế độ tài liệu phiên nói
bằng một dòng rằng trace giữ nó.

### Tác động về bảo mật và quyền

- **Quy tắc 8 là biện pháp kiểm soát cho tài liệu từ bên ngoài.** Nó được nêu ngay trong bước riêng
  của chế độ, không chỉ được trích dẫn. Record bảo mật ngày 2026-10-16 của repository này phát hiện
  rằng một quy tắc chỉ tới được qua một trích dẫn có thể không được đọc (SF7 của nó).
- **Quy tắc 9 được áp hai lần:** cho việc file nào được đọc, và cho những gì trang in ra.
- **File ignore và cảnh báo trong phiên** là biện pháp kiểm soát cho những gì trang nhắc lại.
- **Không tải gì ngoài một kết nối.** Lần chạy đọc một file cục bộ, văn bản dán vào, hoặc một tài liệu
  qua một kết nối sẵn sàng tới dịch vụ của nó. Chính người dùng đã đăng nhập kết nối đó, nên lần chạy
  không chạm tới thứ gì họ tự mình không mở được.

### Kỳ vọng về hiệu năng

Một tài liệu được đọc một lần. Chi phí là kích thước tài liệu cộng file reference, khoảng 150 dòng.

### Các file phần triển khai đụng tới

- `plugins/atk/skills/catchup/SKILL.md`: Scope (phần handles, và dòng phân biệt với `atk:intake`),
  Invocation, phép thử chế độ ở bước 1, một bước ngắn giữa 2 và 4 cho chế độ tài liệu, Output, và
  Definition of done.
- `plugins/atk/skills/catchup/references/document-explainer.md`, một file mới chứa bảng loại, hai
  dạng, trang, các quy tắc trung thành với nguồn, và các trường hợp nhạy cảm.
- `plugins/atk/skills/catchup/evals/trigger_evals.json`: các case dương ở ba ngôn ngữ cho một record
  của kit và cho một tài liệu từ bên ngoài. Các case âm đối với `atk:intake` ("turn this client
  document into requirements"), `atk:review`, `atk:security` và `atk:retro`.
- Các trigger của phần mô tả, ở ba ngôn ngữ: "explain this document", "explain these findings
  simply", "giải thích tài liệu này dễ hiểu", "giải thích finding dễ hiểu",
  "この資料をわかりやすく説明して".
- `README.md`, khối invocation; `docs/skills-overview.md` và `docs/vi/skills-overview.md`.
- `docs/flow/skill-chain.md` và `docs/vi/flow/skill-chain.md`: cột consumes của `catchup`.
- `CLAUDE.md`: danh sách nơi trích dẫn `shared/plain-writing.md` có thêm `catchup`.
- `plugins/atk/shared/plain-writing.md`: dòng nơi trích dẫn có thêm chế độ tài liệu của `catchup`.
- `plugins/atk/shared/host-capabilities.md`: mục kết nối có thêm quy tắc chung, gồm phép thử khả năng,
  ba trạng thái, và tài khoản không bao giờ được ghi lại.
- `plugins/atk/shared/design-sources.md`: "Find the connection by what it can do" trích dẫn mục đó và
  chỉ giữ những gì riêng của Figma.
- `CLAUDE.md`: dòng `host-capabilities.md` trong bảng `shared/` nêu tên các trạng thái kết nối, và
  dòng `design-sources.md` thôi nhận chúng là của mình.

## Các quyết định trong lúc review

- **Một record bảo mật có rủi ro chưa được chấp nhận** được giải thích đầy đủ, kèm một cảnh báo. Lam
  Ngoc Khuong, 2026-10-16, thay vì phương án từ chối nó. Cảnh báo nằm ở đâu thì được chốt sau, xem bên
  dưới.
- **Threat model là một loại đã biết.** Lam Ngoc Khuong, 2026-10-16.
- **Mọi tài liệu, không chỉ record của kit.** Lam Ngoc Khuong, 2026-10-16. Quyết định này mở rộng chế
  độ từ chế độ record thành chế độ tài liệu.
- **Một đường link được đọc qua một kết nối mà harness có**, với bản xuất cục bộ làm phương án dự
  phòng. Lam Ngoc Khuong, 2026-10-16, thay vì phương án luôn xin bản xuất.

Được trả lời trong lúc lập plan triển khai, tất cả bởi Lam Ngoc Khuong ngày 2026-10-16. Mỗi câu trả
lời thay một dòng của design này, và giờ design ghi đúng như câu trả lời:

- **Trang được đặt tên thế nào.** Slug của trang và của trace là loại record của kit hoặc `document`,
  và `ticket` là đường dẫn của một record của kit đã commit hoặc `none`, theo
  `shared/artifact-paths.md`. Tên riêng của tài liệu chỉ xuất hiện trong thân trang. Điều này thay cho
  `ticket` đặt bằng đường dẫn của tài liệu và một subject của trace tạo từ tên tài liệu, cách sẽ đưa
  tên file của khách hàng vào những cái tên mà bước che dữ liệu không bao phủ.
- **Trang là tạm thời.** Nó không bao giờ được đề nghị commit, và cảnh báo về độ nhạy cảm là một dòng
  in ra trong phiên lúc kết thúc, không ghi gì vào trang. Điều này thay cho một cảnh báo đưa ra trước
  mọi commit của trang, vì `atk:catchup` không đề nghị commit nào.
- **Trang nằm ngoài git** trong `docs/derived/catchup/documents/`, nhờ một file ignore chứa `*`, được
  kiểm tra bằng `git check-ignore -q`, như run trace. Điều này thay cho việc dựa vào cảnh báo trong một
  dự án commit `docs/derived/`.
- **Một giá trị `--out` vẫn nằm trong trace như được đưa vào,** vì người chạy skill đã chọn đường dẫn
  đó, và ở chế độ tài liệu phiên nói rõ điều này.
- **`## Scope` của `atk:intake` có thêm dòng đối ứng,** gửi người muốn hiểu một tài liệu họ được trao
  sang `atk:catchup`.

Được sửa sau review của phần triển khai, ngày 2026-10-16, với sự đồng ý của Lam Ngoc Khuong, khi record
này chưa được commit lên `main`: bước chọn chế độ áp danh sách của quy tắc 9 trước khi phân loại một
file, chỉ gửi ticket id hoặc URL trên host của tracker tới tracker, và hỏi lại khi gặp một thư mục hoặc
một đường dẫn không tồn tại; trace được đặt tên `document` trừ khi đầu vào mở đầu bằng một ticket hay
pull request; trang có `title` riêng; bảng loại mang đúng các trường mà record thực sự có; một threat
model có biện pháp kiểm soát `none` kích hoạt cảnh báo; một lần đọc thất bại qua kết nối sẵn sàng thì
chuyển sang phương án dự phòng; và trang chỉ được giữ ngoài git. Hai báo cáo review nằm trong pull
request của phần triển khai.

## Câu hỏi mở

Không có. Mọi câu hỏi design này nêu ra đã được Lam Ngoc Khuong trả lời ngày 2026-10-16.
