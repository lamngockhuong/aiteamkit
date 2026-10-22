---
title: atk:review cân nhắc lỗ hổng trong luật cho agent hay gặp đến đâu, và một lần sửa để trạng thái chưa có luật cho một quy tắc mặc định
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-21, by instruction to the agent. Returned to `IN REVIEW` on
2026-10-21 by his instruction, to carry Q3 and Q4, answered during implementation, and approved again
by him the same day. Edited on 2026-10-21 by his instruction to carry Q5 to Q8, answered on the
review of PR #141, and kept `APPROVED`.

# atk:review cân nhắc lỗ hổng trong luật cho agent hay gặp đến đâu, và một lần sửa để trạng thái chưa có luật cho một quy tắc mặc định

Bản tiếng Việt để đọc cho tiện. Bản gốc là
`docs/records/design/261021-0450-review-severity-by-reach.md`; khi hai bản khác nhau, bản tiếng Anh
là bản đúng.

## Tóm tắt

PR #139 trải qua bốn vòng review, và vòng nào cũng tìm ra lỗi mới trong lần sửa của vòng trước. Hai
lần, finding `BLOCKING` của vòng sau sinh ra từ chính cách sửa mà vòng trước gợi ý, được làm đúng
từng chữ. Một lần review yêu cầu bỏ kính ngữ để "anh Khương" khớp với "Lam Ngoc Khuong" (S60 của lần
review lúc 01:58). Lần sửa bỏ `anh` và `em` ở cả hai vế của phép so sánh, nên một dòng Team "Đức Anh"
thành "Đức". Thế là một người khác tên Đức khớp đúng với dòng đó, và đây chính là lỗi nhận nhầm người
mà finding B3 trước đó được lập ra để chặn (B1 của lần review lúc 04:08). Trong lúc ấy,
`plugins/atk/shared/run-trace.md`, file mà mọi lượt chạy của mọi skill đều đọc, đã tăng từ 21.028
lên 24.781 byte.

Các finding đều có thật; từng cái đã được đối chiếu với file. Có hai lý do khiến vòng lặp càng lúc
càng phình ra thay vì khép lại:

- **Review chỉ xếp hạng theo cơ chế.** Lỗ hổng trong một luật mà agent làm theo sẽ là `SHOULD FIX`
  ngay khi gọi tên được cơ chế của nó, bất kể có ai từng gặp hay không: hai dòng Team "Trần Thị Hà"
  và "Trần Thị Hạ", một `user.name` tiếng Nhật, một trace bị cắt lúc nửa đêm ngay ở dòng `end`.
- **Cách sửa nào được gợi ý cũng là một luật mới, và lần sửa nhận luôn luật đó.** Mỗi luật mới lại mở
  ra những trạng thái mới, và vòng sau tìm ra chúng.

Bản design này thay đổi ba điều:

- `atk:review` gán cho mỗi finding về một luật viết cho agent một `Reach`: `ordinary` khi điều kiện
  kích hoạt là đầu vào mà người dùng kit gặp trong công việc thường ngày, `edge` khi không phải vậy.
  Finding `edge` là `NIT`, trừ khi hậu quả của nó thuộc năm loại mà kit không bao giờ chấp nhận.
- Luật 5 của `shared/team-roles.md` có thêm một quy tắc mặc định cho mọi trạng thái không luật nào
  phủ tới: nói ra điều đó, hỏi người liên quan, và dừng lại khi không hỏi được ai. Lỗ hổng mà quy tắc
  mặc định đã xử lý đúng thì không phải là finding.
- `atk:fix` cùng vòng review và sửa chọn cách sửa hẹp nhất trong ba cách, và không bao giờ nhận luật
  mà review gợi ý khi chưa xem xét nó.

Code nằm ngoài phạm vi. Lỗi tranh chấp đồng thời hay lỗi lệch một đơn vị trong code của dự án vẫn giữ mức độ
như hiện nay, dù hay gặp hay hiếm gặp.

Lam Ngoc Khuong sở hữu thay đổi này và phê duyệt nó.

## Yêu cầu

Yêu cầu được đưa ra trong phiên ngày 2026-10-21, sau khi PR #139 được merge: một bản design cho thay
đổi của `atk:review` đã đề xuất trong phiên đó, và một thay đổi ở `atk:fix` nơi cần đến. Tiêu chí
chấp nhận, viết lại ở đây:

1. Lỗ hổng trong luật cho agent mà không ai trong các đội dùng kit gặp phải trong công việc thường
   ngày sẽ không còn lên tới `SHOULD FIX`. Ngoại lệ là khi hậu quả của nó phá vỡ tiền đề làm việc theo đội,
   làm lộ bí mật hay dữ liệu của một người, hành động vượt quá sự đồng ý của một người, làm mất lịch
   sử, hoặc phá vỡ một hợp đồng công khai.
2. Review có thể gợi ý để nguyên một trạng thái chưa có luật như một phương án sửa hợp lệ, chứ không chỉ
   gợi ý thêm luật.
3. Một lần sửa chọn thay đổi hẹp nhất và nói rõ đã chọn thay đổi nào, để không nhận về một luật được
   gợi ý mà chưa ai cân nhắc những lỗ hổng của chính luật đó.
4. Lỗi trong code được xếp hạng như hiện nay.
5. Không bỏ sót điều gì người review tìm ra: finding `edge` vẫn được báo cáo, ở mức `NIT`.

## Hiện trạng

**Kết luận quyết định finding có thật hay không, chứ không quyết định nó hay xảy ra đến đâu.**
`plugins/atk/skills/review/SKILL.md:155-177` gán cho mỗi ứng viên một trong `CONFIRMED`, `PLAUSIBLE`
hoặc `REFUTED`, và cấm bác một ứng viên "for being unlikely" (`:170-173`). Luật đó đúng với code: đó
là "how a race condition ships". `PLAUSIBLE` dành cho điều kiện kích hoạt phụ thuộc vào thời điểm
hay cấu hình, và giới hạn nó ở `SHOULD FIX`. Không có gì dành cho điều kiện kích hoạt chắc chắn xảy
ra khi gặp nhưng hiếm khi gặp. Lỗ hổng trong một luật viết bằng văn xuôi được xác nhận chỉ bằng cách
đọc, nên nó nhận mức độ nào cũng được.

**Mức độ chỉ dựa vào hậu quả.** Bảng ở `review/SKILL.md:197-201` ghi "`SHOULD FIX`: Real problem".
Theo định nghĩa đó, một luật văn xuôi bỏ ngỏ một trạng thái là một vấn đề có thật, dù tần suất là
bao nhiêu.

**Vòng `boundary` đi săn trạng thái.** `plugins/atk/skills/review/references/review-rounds.md:45`
mở đầu bằng "Inputs and states, not lines" và không bao giờ bị bỏ qua. Trong bốn vòng review của
PR #139, vòng này trả về 21, 28, 27 và 1 finding. Nó là nguồn finding lớn nhất trong ba vòng review
toàn bộ thay đổi.

**Mục `Fix` của một finding là một thay đổi cụ thể.**
`plugins/atk/skills/review/references/report-format.md:84` đòi "the concrete change", và `:105` ghi
"a finding with no suggestion is a complaint". Trên thực tế, thay đổi cụ thể cho một trạng thái chưa
được định nghĩa là một mệnh đề mới.

**Vòng review và sửa sửa mọi `SHOULD FIX`.** `plugins/atk/shared/review-fix-loop.md:86-88`: "Fix it,
unless it is genuinely separate work". `:93` giữ cách sửa ở "the smallest change that removes the
finding", và `atk:fix` nhắc lại điều đó ở bước 3, `plugins/atk/skills/fix/SKILL.md:129-135`, và cho
vòng lặp ở `:198`. Không chỗ nào nói cách phân biệt một thay đổi nhỏ với một luật trông nhỏ nhưng mở
ra trạng thái mới.

**Kit không có quy tắc mặc định cho trạng thái chưa có luật.** Luật 5 của
`plugins/atk/shared/team-roles.md:63-64` bảo chỉ hỏi những gì repository không trả lời được. Không
chỗ nào nói agent làm gì khi một luật đơn giản là không với tới trường hợp trước mắt. Vì vậy mỗi lỗ
hổng review tìm ra trông như một cái lỗ mà chỉ luật mới mới lấp được.

**Cái giá ở PR #139.** Bốn lần review là các lượt chạy `atk:review` ngày 2026-10-21 lúc 00:16,
01:58, 04:08 và 05:10:

| Review | Đối tượng | `BLOCKING` | `SHOULD FIX` | `NIT` |
|---|---|---|---|---|
| 00:16 | thay đổi | 0 | 29 | 37 |
| 01:58 | lần sửa của nó | 3 | 23 | 37 |
| 04:08 | lần sửa tiếp theo | 2 | 34 | 22 |
| 05:10 | các chỗ sửa của lần sửa đó | 0 | 3 | 1 |

Hai finding `BLOCKING` của lần review lúc 04:08 đều bắt nguồn từ cách sửa được gợi ý và làm đúng
như đã viết:

- B1 đến từ S60 của lần 01:58, đã dẫn ở trên.
- B2 đến từ cách sửa B2 của lần 01:58, vốn bảo "limit" dòng 1 của `shared/state-signals.md`. Làm
  đúng như đã viết thì dòng đó mất phần khuyến nghị cho một tài liệu đã có mà design nêu tên.

`Reach` được đề xuất sẽ phân loại một mẫu các finding `SHOULD FIX` của lần 04:08 như sau. Mỗi dòng
là nhận định của bản design này, đưa ra sau khi sự việc đã xảy ra, và không phải là số đo:

| Finding | Điều kiện kích hoạt | Reach | Hậu quả được bảo vệ | Sẽ thành |
|---|---|---|---|---|
| S1 | Hai dòng Team chỉ khác nhau ở dấu thanh | `edge` | không | `NIT` |
| S2 | `田中太郎さん` được đưa vào với hậu tố dính liền | `edge` | không | `NIT` |
| S6 | Một `user.name` CJK chỉ có một từ | `edge` | không | `NIT` |
| S34 | Sự kiện đầu tiên sau nửa đêm của một phiên lại là sự kiện đóng phiên | `edge` | không | `NIT` |
| S12 | `--answer` chạy trên một branch, PR được đọc bằng cách chuyển sang branch đó | `ordinary` | không | `SHOULD FIX` |
| S25 | `atk:orchestrate` gặp một design còn ở `DRAFT` | `ordinary` | không | `SHOULD FIX` |
| S7 | Người phê duyệt duy nhất, chạy không tương tác, đưa ra tên ngắn | `edge` | có, một phê duyệt bị giữ theo sai luật | `SHOULD FIX` |
| B1 | Dòng Team "Đức Anh", một câu "anh Đức" được chuyển lời | `ordinary` | có, quyết định của một vai trò do người khác đưa ra | `BLOCKING` |

## Phương án

Tiêu chí, theo thứ tự: C1, review vẫn tìm ra những gì sẽ xảy ra; C2, vòng lặp hội tụ; C3, chi phí
trên mỗi lượt chạy, qua các file dùng chung mà lượt nào cũng đọc; C4, khả năng hoàn tác; C5, phần
`atk:review` phải thay đổi nhiều đến đâu.

### A. Reach cho finding về luật cho agent, quy tắc mặc định cho trạng thái chưa có luật, và cách sửa hẹp nhất (được chọn)

`atk:review` gắn cho mỗi finding về một luật viết cho agent nhãn `Reach: ordinary` hoặc
`Reach: edge`. Finding `edge` là `NIT`, trừ khi hậu quả của nó thuộc năm loại được bảo vệ. Luật 5 của
`shared/team-roles.md` có thêm quy tắc mặc định cho trạng thái chưa có luật, và lỗ hổng mà quy tắc
mặc định xử lý đúng thì không phải là ứng viên. `atk:fix` và vòng lặp chọn cách sửa hẹp nhất trong ba
cách.

- C1: giữ được. Mọi finding vẫn được báo cáo, và các hậu quả được bảo vệ vẫn giữ nguyên trọng lượng
  dù hay gặp hay hiếm gặp.
- C2: mạnh. Finding `edge` thôi kéo theo các lần sửa, và quy tắc mặc định khiến lỗ hổng không còn cần
  đến luật mới.
- C3: một đoạn trong `team-roles.md`, lượt chạy nào cũng đọc. Đó là cái giá, và nó nhỏ so với 3.753
  byte mà `run-trace.md` tăng thêm chỉ sau một vòng review.
- C4: cao. Chỉ có văn xuôi. Bỏ nhãn đi là cách xếp hạng trở lại như hiện nay.
- C5: vừa phải. Một nhãn, một luật về mức độ, một thay đổi ở vòng `boundary`, một dạng `Fix` mới.

### B. Chỉ thay đổi `atk:fix` và vòng lặp

Giữ review như hiện nay, và để người sửa quyết định không sửa những gì.

- C1: giữ được.
- C2: yếu. Người sửa sẽ từ chối từng finding `SHOULD FIX` một, trong khi bảng của vòng lặp ghi rằng
  `SHOULD FIX` thì phải sửa trừ khi là phần việc riêng. Mỗi lần từ chối thành một tranh chấp mà Tech
  Lead phải phân xử.
- C3: không có. C4: cao. C5: không có.
- Bị loại vì cách xếp hạng vẫn sai, và chi phí chuyển sang một người phải đọc mọi tranh chấp.

### C. Giới hạn số finding một lần review trả về, hoặc chỉ cho một vòng

- C1: mất. Giới hạn bỏ finding theo số lượng, không theo mức nặng nhẹ. Finding `BLOCKING` B1 của lần
  04:08 là một trong 58 finding.
- C2: bị ép chứ không tự đạt được. C3: không có. C4: cao.
- Bị loại vì thua ở C1, tiêu chí quan trọng nhất.

### D. Không làm gì, và tìm lỗ hổng qua run trace

Thôi review văn xuôi để tìm trạng thái hiếm gặp, và để `atk:tailor --feedback` tìm ra những gì lượt
chạy thật gặp phải.

- C1: yếu đi. Một lần phê duyệt sai người chỉ được phát hiện sau khi nó đã xảy ra trong một đội.
- C2: mạnh. C3: không có. C4: cao. C5: vòng `boundary` mất một nửa đối tượng của nó.
- Đội sẽ mặc nhiên chọn phương án này vì nó rẻ nhất. Nó bị loại vì các hậu quả được bảo vệ phải được
  bắt trước một lượt chạy, chứ không phải đếm sau khi đã xảy ra. Trace vẫn có giá trị, và phương án A
  dùng chúng làm bằng chứng như ở dưới.

## Cách tiếp cận được chọn

### `Reach`, và những gì nó thay đổi

Phạm vi: finding có đối tượng là một luật viết cho agent làm theo. Phạm vi này gồm `SKILL.md` và
`references/` của một skill, một file dùng chung, một prompt, file chỉ dẫn agent của một dự án, hay
bất kỳ file Markdown nào mà agent đọc như chỉ dẫn. Code, cấu hình, schema và test giữ cách xếp hạng
hiện nay. Finding nằm trên cả hai, một chỉ dẫn và đoạn code mà chỉ dẫn đó điều khiển, được xếp hạng
như code.

- **`ordinary`.** Điều kiện kích hoạt là đầu vào hay trạng thái mà người dùng của thứ làm theo luật
  đó gặp trong công việc thường ngày: với file của kit là các đội dùng kit, với file của một dự án là
  đội của dự án hoặc người dùng cuối của nó (Q6 trong `Answered` bên dưới). Với kit, đó là một cái tên
  phổ biến trong các đội kit phục vụ, một dạng dự án thông thường, một lượt chạy bắt đầu theo cách
  `## Invocation` của skill chỉ ra, một harness mà kit hỗ trợ. Finding nói rõ là trường hợp nào.
- **`edge`.** Điều kiện kích hoạt đòi một tổ hợp không thông thường: hai người có tên chỉ khác nhau ở
  dấu, một hệ chữ mà đội không dùng, một phiên kết thúc đúng lúc nửa đêm. Bằng chứng sẽ chuyển một
  finding sang `ordinary`: một run trace, một bản ghi, một issue hay một test cho thấy điều kiện kích
  hoạt đã xảy ra một lần. Không có giá trị thứ ba cho điều kiện kích hoạt đã thấy trong một lượt chạy:
  nó là `ordinary`, và nhận cùng mức độ (Q1 trong `Answered` bên dưới).

Finding `edge` là `NIT`, trừ khi hậu quả của nó thuộc năm loại sau, vốn giữ mức độ mà hậu quả đó
đáng nhận:

1. quyết định của một vai trò bị đưa ra, hay một trạng thái phê duyệt bị đặt vào, mà không có người
   sở hữu nó, theo luật 2 và 3 của `shared/team-roles.md`;
2. bí mật hay dữ liệu của một người bị ghi ra, gửi đi hay hiển thị, theo luật 9;
3. một hành động vượt quá ranh giới đồng ý của `shared/finalize-steps.md`;
4. lịch sử hay phần việc chưa commit của một người bị mất hoặc bị ghi đè;
5. một hợp đồng công khai bị phá vỡ, theo `shared/spec-docs.md`.

Năm loại này nằm cố định trong `review/SKILL.md`, là mức sàn của kit, giống như
`shared/project-overrides.md` cố định những gì một override không bao giờ được bỏ. Dự án muốn thêm
hậu quả của riêng mình thì ghi một luật kèm mức độ vào review checklist của dự án, theo
`shared/review-checklist.md`, và Reach không bao giờ hạ mức độ đó (Q2 trong `Answered` bên dưới).

`PLAUSIBLE` giữ nguyên và vẫn giới hạn ở `SHOULD FIX`. Reach là nhãn thứ hai đặt bên cạnh, ghi trên
dòng `Raised by` của finding dưới dạng `Reach: edge`, nên các finding `NIT` ở dạng một dòng mang nhãn
này trong cột đó.

### Quy tắc mặc định cho trạng thái không luật nào phủ tới

Luật 5 của `shared/team-roles.md` có thêm một đoạn:

> A state no rule of the skill covers is not filled by guessing what the rule would have said. The
> run says the case is not covered, asks the person running the skill where the answer is theirs to
> give, and otherwise names the person rule 3 gives it to and asks them, then goes on with the
> answer. Where that person is not in the session, the run records the case as an open question
> carrying their name, per rule 1, in its artifact or its closing message, and goes on with what
> does not depend on it; nothing reaches them past the consent line of `shared/finalize-steps.md`.
> A run that can do neither stops, and names the case in its closing message and on its trace's
> `end` line.

Vòng `boundary` và bước 5 của `review/SKILL.md` bỏ một ứng viên về trạng thái chưa có luật trong một
luật mà lượt chạy `atk` làm theo, khi quy tắc mặc định này xử lý đúng nó (Q6 trong `Answered` bên
dưới), tức là hỏi thì an toàn và người được quy tắc mặc định hỏi là người sở hữu câu trả lời. Lỗ hổng
mà chính quy tắc mặc định xử lý sai thì vẫn là finding: một lượt chạy không thể dừng, một câu trả lời
mà lượt chạy không gọi tên được người sở hữu, hay một câu hỏi sẽ làm lộ bí mật. Báo cáo nêu số ứng
viên đã bỏ theo cách này, như cách nó đếm các ứng viên bị bác.

### Mục `Fix` của một finding

`report-format.md` cho phép `Fix` mang một trong ba dạng, nêu tên dạng ở đầu dòng:

- **Correct:** một câu nói điều sai, và câu đó được viết lại.
- **Leave to the default:** một câu lấp một trạng thái chưa có luật bằng cách đoán xem luật lẽ ra
  sẽ nói gì, và quy tắc mặc định của luật 5 trả lời đúng trạng thái đó, nên câu ấy bị bỏ đi hoặc
  không được thêm vào. Một trạng thái chỉ đơn thuần chưa có luật, mà quy tắc mặc định xử lý đúng, thì
  hoàn toàn không phải là finding. Câu sai mà chính nó là một lời đoán như vậy thì nhận dạng này trước
  **Correct** (Q8 trong `Answered` bên dưới), và dạng này chỉ áp dụng cho luật mà lượt chạy `atk` làm
  theo (Q6).
- **Add a rule:** quy tắc mặc định sẽ trả lời sai trong một trường hợp thường gặp, hoặc trong bất kỳ
  trường hợp nào có hậu quả thuộc năm loại trên, hoặc, trên một file agent không thuộc quyền chi phối
  của luật 5, trạng thái đó cần một câu trả lời mà file chưa có (Q7 trong `Answered` bên dưới).
  Finding nêu, trong một dòng, những trạng thái mà chính luật mới mở ra, để người sửa cân nhắc.

### Cách sửa hẹp nhất

`shared/review-fix-loop.md`, dòng `SHOULD FIX` và đoạn văn ngay dưới nó, và bước 3 của `atk:fix`:

- Trên một luật mà agent làm theo, chọn dạng đầu tiên trong ba dạng xóa được finding: sửa câu, rồi
  đến để cho quy tắc mặc định, rồi đến thêm luật; câu sai đoán mò một trạng thái mà quy tắc mặc định
  đã trả lời thì bị bỏ đi chứ không viết lại (Q8). Cách sửa được gợi ý chỉ là gợi ý. Khi người sửa
  chọn dạng khác, họ nói là dạng nào và vì sao.
- Lần sửa nào thêm luật thì nêu những trạng thái luật đó mở ra và cân nhắc chúng trước khi đưa vào.
- Lần sửa nào làm lớn thêm một file mà lượt chạy nào cũng đọc, `shared/team-roles.md`,
  `shared/run-trace.md` hay `shared/artifact-paths.md`, thì ghi kích thước trước và sau vào bản ghi.

Mục 5 của mẫu báo cáo sửa lỗi có thêm một dòng: dạng mà mỗi finding đã nhận.

### Mô hình dữ liệu và migration

`N/A`. Không có dữ liệu lưu trữ.

### Hợp đồng API

`N/A`. Không tùy chọn dòng lệnh nào và không `argument-hint` nào thay đổi. Báo cáo review có thêm nhãn `Reach` và
dạng `Fix`. Người đọc một báo cáo cũ sẽ không thấy cả hai, và điều đó nghĩa là "chưa được đánh giá".

### Lỗi và trường hợp biên

- Finding mà người review không đánh giá được mức độ hay gặp thì là `ordinary`. Đánh giá sai thành
  `ordinary` chỉ tốn thêm một `SHOULD FIX`, còn đánh giá sai thành `edge` thì để một lỗi lọt ra ngoài
  ở mức `NIT`.
- Finding vừa là `edge` vừa là `PLAUSIBLE` thì là `NIT`. Ghi cả hai nhãn.
- Luật convention của dự án có mức độ đã ghi lại thì giữ mức độ đó, theo `review/SKILL.md:211-212`.
  Reach không hạ một luật mà đội đã viết ra.
- Finding về code: không có reach, theo phạm vi.

### Tương thích ngược

Báo cáo viết trước thay đổi này không có `Reach`. Lần review thứ hai trên cùng đối tượng lấy định
danh của finding trước đó như trước, và gán cho nó một reach. Theo luật đánh số lại của
`report-format.md:72`, finding có mức độ hạ từ `S` xuống `N` giữ ID cũ trong tiêu đề, `(was S3)`.

### Triển khai

Một pull request: các file review, vòng lặp, `atk:fix`, luật 5, và tài liệu của chúng ở cả hai ngôn
ngữ. Lần review kế tiếp cho một thay đổi của kit sẽ áp dụng nó. Kết quả được kiểm tra qua hai lần
review kế tiếp cho một thay đổi skill, bằng số finding theo từng mức độ và số finding `SHOULD FIX` mà
mỗi vòng sửa đưa vào.

### Hoàn tác

Hoàn nguyên pull request. Không có gì phụ thuộc vào nhãn này.

### Khả năng quan sát

Mục `## Rounds` của báo cáo review đếm finding theo reach. Nó cũng đếm các ứng viên bị bỏ vì quy tắc
mặc định đã xử lý chúng. Bản ghi sửa lỗi nêu dạng mà mỗi finding đã nhận. Gộp lại, những con số này
cho lần review sau đọc được vòng sửa đã hội tụ ra sao. Run trace không thay đổi.

### Ảnh hưởng tới bảo mật và quyền

Không mở rộng gì. Hậu quả được bảo vệ số 2 và 3 giữ bí mật và sự đồng ý ở mức độ đầy đủ, dù hay gặp
hay hiếm gặp.

### Kỳ vọng về hiệu năng

Luật 5 dài thêm khoảng 400 byte, lượt chạy nào cũng đọc. Review trên luật cho agent sẽ trả về ít
finding `SHOULD FIX` hơn. Vòng sửa trên luật cho agent sẽ thêm ít dòng hơn mỗi vòng. Cả hai con số
đều chưa được đo.

### Các file mà phần triển khai chạm tới

- `plugins/atk/shared/team-roles.md`: luật 5, quy tắc mặc định.
- `plugins/atk/skills/review/SKILL.md`: bước 5, các ứng viên bị bỏ; bước 6, reach đặt cạnh bảng mức
  độ và năm hậu quả được bảo vệ, cố định ở đó (Q2).
- `plugins/atk/skills/review/references/review-rounds.md`: vòng `boundary` và các con số ở mục
  `## Rounds` của báo cáo.
- `plugins/atk/skills/review/references/report-format.md`: `Reach` trên dòng `Raised by`, ba dạng
  `Fix`, và dạng một dòng của `NIT`.
- `plugins/atk/shared/review-fix-loop.md`: dòng `SHOULD FIX` và đoạn về cách sửa hẹp nhất.
- `plugins/atk/skills/fix/SKILL.md`: bước 3, và câu ở bước 6 buộc một lần sửa trong vòng lặp tuân
  theo bước 3.
- `plugins/atk/skills/fix/references/report-template.md`: mục 5, dạng của từng finding.
- `docs/skills-overview.md`, `docs/codebase-summary.md` và bản sao `docs/vi/` của chúng, ở những chỗ
  mô tả mức độ trong review hoặc luật 5.

## Câu hỏi mở

Không còn câu nào.

### Answered

| Câu hỏi | Câu trả lời | Người trả lời | Ngày | Người chuyển lời |
|---|---|---|---|---|
| Q1. Hai giá trị reach, `ordinary` và `edge`, đã đủ chưa, hay cần giá trị thứ ba cho điều kiện kích hoạt mà trace đã cho thấy? | "ok, đồng ý", đồng ý với đề xuất đưa ra trong phiên: không có giá trị thứ ba, vì bằng chứng đã chuyển finding sang `ordinary` | Lam Ngoc Khuong | 2026-10-21 | |
| Q2. Năm hậu quả được bảo vệ nên nằm trong `shared/review-checklist.md`, nơi dự án có thể thêm hậu quả của mình, hay cố định trong `review/SKILL.md`? | "ok, đồng ý", đồng ý với đề xuất đưa ra trong phiên: cố định trong `review/SKILL.md`, là mức sàn của kit; dự án thêm hậu quả của mình qua một luật kèm mức độ trong review checklist của dự án | Lam Ngoc Khuong | 2026-10-21 | |
| Q3. S1 của lần review triển khai đầu tiên: "Leave to the default" trùng điều kiện với ứng viên bị bỏ. Nó phủ trường hợp nào? | "Định nghĩa lại", chọn đề xuất đưa ra cho anh: dạng này phủ một câu đoán mò một trạng thái mà quy tắc mặc định đã trả lời, và cách sửa là bỏ hoặc không thêm câu đó; trạng thái chỉ đơn thuần chưa có luật thì bị bỏ, không báo cáo | Lam Ngoc Khuong | 2026-10-21 | |
| Q4. S2 của cùng lần review: quy tắc mặc định của luật 5 có nên hỏi người đang chạy skill khi luật 3 giao câu trả lời cho một vai trò khác? | "Thêm điều kiện", chọn đề xuất đưa ra cho anh: hỏi người đang chạy skill khi câu trả lời thuộc về họ, nếu không thì hỏi người mà luật 3 giao | Lam Ngoc Khuong | 2026-10-21 | |
| Q5. S1 của lần review PR #141: quy tắc mặc định làm gì khi người mà luật 3 chỉ định không có mặt trong phiên? | Chọn đề xuất của review đưa ra cho anh: ghi một câu hỏi mở mang tên người đó, tiếp tục với những gì không phụ thuộc vào nó, không gửi gì vượt quá ranh giới đồng ý; chỉ dừng khi không làm được cả hai | Lam Ngoc Khuong | 2026-10-21 | |
| Q6. S2 của cùng lần review: quy tắc mặc định, cùng việc bỏ ứng viên và dạng sửa dựa trên nó, có áp dụng cho file agent của chính dự án không? | "Giới hạn default", chọn đề xuất đưa ra cho anh: chỉ áp dụng cho luật mà lượt chạy `atk` làm theo; trên mọi file agent khác, ứng viên được giữ và xếp hạng theo reach, và `ordinary` nghĩa là người dùng của thứ làm theo luật đó | Lam Ngoc Khuong | 2026-10-21 | |
| Q7. S3 của cùng lần review: dạng nào hợp với một finding `edge` được giữ lại vì một trong năm hậu quả? | Chọn đề xuất của review đưa ra cho anh: **Add a rule**, và điều kiện của dạng này nay phủ cả mọi trường hợp có hậu quả thuộc năm loại; và, khi chọn "Mở rộng Add a rule" ở S18 của lần review cho lần sửa này, phủ cả trạng thái trên file agent không thuộc quyền chi phối của luật 5 mà cần một câu trả lời file chưa có | Lam Ngoc Khuong | 2026-10-21 | |
| Q8. S4 của cùng lần review: câu sai đoán mò một trạng thái mà quy tắc mặc định đã trả lời thì viết lại hay bỏ đi? | "Thêm ngoại lệ", chọn đề xuất đưa ra cho anh: bỏ đi, nên với câu đó **Leave to the default** đứng trước **Correct**; ngoài ra thứ tự giữ nguyên | Lam Ngoc Khuong | 2026-10-21 | |

Q3 và Q4 được trả lời trong lúc triển khai design. Q3 sửa gạch đầu dòng `Leave to the default` của
`### The Fix of a finding`; Q4 sửa đoạn trích dẫn và đoạn ngay dưới nó trong
`### The default for a state no rule covers`, cùng ADR.

Q5 đến Q8 được trả lời trong lần review pull request. Q5 sửa đoạn trích dẫn trong
`### The default for a state no rule covers`; Q6 sửa gạch đầu dòng `ordinary` của
`### Reach, and what it changes`, đoạn ngay dưới đoạn trích dẫn, và gạch đầu dòng
`Leave to the default`; Q7 sửa gạch đầu dòng `Add a rule` và Q8 sửa gạch đầu dòng
`Leave to the default` của `### The Fix of a finding` cùng gạch đầu dòng đầu tiên của
`### The narrowest fix`; cả bốn đều sửa ADR.

Q1 sửa `### Reach, and what it changes` (gạch đầu dòng `edge`). Q2 sửa cùng mục đó (đoạn sau năm
hậu quả) và `### Files the implementation touches`.

ADR: `docs/adr/0008-review-weighs-reach-of-agent-rule-gaps.md`
