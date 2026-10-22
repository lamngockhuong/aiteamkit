---
title: Run trace được khởi động bằng một dòng trong workflow của mọi skill, và được giữ ngoài git bằng một file ignore nằm ngay trong thư mục của nó
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-13
updated: 2026-10-14
ticket: none
---

Lam Ngoc Khuong duyệt ngày 2026-10-14, bằng chỉ thị cho agent.

# Run trace được khởi động bằng một dòng trong workflow của mọi skill, và được giữ ngoài git bằng một file ignore nằm ngay trong thư mục của nó

Bản tiếng Việt để đọc cho tiện. Bản gốc là `docs/records/design/261013-2358-run-trace-reached-from-the-workflow.md`; khi hai bản khác nhau, bản
tiếng Anh là bản đúng.

Bản này thay cho `docs/records/design/261011-1626-run-trace.md`. Mọi quyết định của design đó vẫn
giữ, trừ hai điều bản này thay đổi, liệt kê ở mục Những gì thay đổi: cách một lượt chạy đi tới chỗ
ghi trace, và cách giữ trace ngoài git. Mọi thứ khác xin đọc ở design đó; bản này chỉ nhắc lại những
gì hai thay đổi chạm tới.

## Tóm tắt

Design đã duyệt đặt nghĩa vụ để lại run trace riêng trong quy tắc 10 của
`plugins/atk/shared/team-roles.md`, với lập luận rằng mọi skill đều đọc file đó. Giai đoạn 1 của
`plans/261012-0052-run-trace/` đã kiểm tra lập luận này, đúng như bước 5 của nó được viết ra để làm,
và lập luận không đứng vững: `/atk:help` chạy hai lần, trên hai model, đọc `SKILL.md` của chính nó,
không hề mở `team-roles.md`, và không ghi trace nào.

Từ đó có hai thay đổi, mỗi thay đổi đều được thử trong một dự án nháp trước khi ghi vào đây:

- **Mỗi `SKILL.md` có thêm một dòng riêng** ở đầu `## Workflow`, ngay dưới dòng override mà skill
  nào cũng đã có: tạo trace của lượt chạy này ở đường dẫn của nó, và làm theo những gì
  `shared/run-trace.md` nói trước khi tạo file, ở mỗi bước, và lúc kết thúc. Có dòng đó, lượt chạy đã
  đọc `run-trace.md` và làm theo, ba trên ba lượt.
- **Trace được giữ ngoài git bằng `<docs root>/derived/traces/.gitignore` chứa `*`**, không phải bằng
  một dòng trong `.git/info/exclude`. Claude Code coi file exclude là file nhạy cảm và không cho một
  lượt chạy headless ghi vào, nên nếu giữ cách cũ thì chính những lượt chạy không ai theo dõi, lý do
  tính năng này tồn tại, sẽ không có trace nào.

Quy tắc 10 giữ nguyên chỗ cũ, vừa là nghĩa vụ, vừa là điều thứ mười mà override không được bỏ.

## Yêu cầu

Không đổi so với design bị thay thế, từ AC1 tới AC6. Bản sửa này trả lời hai trong số đó:

| # | Tiêu chí | Vì sao mở lại |
|---|-----------|-----------------|
| AC1 | Mỗi lượt chạy skill để lại dữ liệu mà về sau có thể dùng để cải thiện quy trình và skill | Hai lượt chạy không để lại gì |
| AC2 | Cơ chế này hoạt động với cả những lượt chạy không ai theo dõi: subagent và CLI của agent khác, trước hết là `atk:orchestrate` | Lượt chạy headless không ghi được `.git/info/exclude`, nên không bao giờ qua được bước kiểm tra |

## Hiện trạng

- **Quy tắc 10 đã có trong branch, nhưng không được đọc.** `plugins/atk/shared/team-roles.md:122-129`
  trên `feat/run-trace`. Mỗi skill trích dẫn file này trong `## Roles` bằng "See `shared/team-roles.md`",
  trong đó có `plugins/atk/skills/help/SKILL.md:47`, và không có gì bảo agent mở nó ra.
- **Nhắc thẳng trong skill cũng không được đọc như một chỉ thị.** Bước 4 của plan đã sửa
  `plugins/atk/skills/help/SKILL.md:24-25` để nói skill này "writes nothing but its run trace, per
  rule 10 of `shared/team-roles.md`". Các lượt chạy sau đó đọc file ấy mà vẫn không ghi trace.
- **Một dòng trong mọi workflow thì đã được làm theo.** Cả 24 file `SKILL.md` đều mở đầu `## Workflow`
  bằng "Before step 1, read `.atk/overrides/<skill>.md` when it exists, per rule 7 of
  `shared/team-roles.md`." (`plugins/atk/skills/help/SKILL.md:64`). Mọi lượt chạy dưới đây đều báo
  không có override, tức là lần nào dòng đó cũng được thực hiện.
- **Cơ chế ignore đã duyệt ghi vào bên trong thư mục git.** `plugins/atk/shared/run-trace.md` trên
  branch, mục "Where it lives", chép lại dòng exclude của progress log
  (`plugins/atk/shared/artifact-paths.md:325-333`).
- **Độ dài `SKILL.md`.** `plugins/atk/skills/review/SKILL.md` và `plugins/atk/skills/verify/SKILL.md`
  đang ở 299 dòng, trong khi giới hạn là 300 (`CONV-006`); thêm hai dòng thì mỗi file phải bớt được
  hai dòng ở chỗ khác.

## Những gì đã chạy

Tất cả chạy trong một repository git nháp chỉ có một commit, bằng `claude -p "/atk:help"` nạp một thư
mục plugin qua `--plugin-dir`, và `atk@atk` đã cài được tắt trong lúc chạy. Plugin được nạp là bản
làm việc của branch, phiên bản 0.1.8 theo chính phiên đó báo, hoặc một bản chép của nó trong thư mục
nháp với đúng một thay đổi được nêu. Chi phí là số phiên đó báo.

| # | Model | Plugin | Kết quả | Chi phí |
|---|-------|--------|--------|------|
| R1 | sonnet | branch nguyên trạng: quy tắc 10, và `help/SKILL.md:24` nêu tên nó | Không có trace, không có dòng nào nói lý do. `team-roles.md` không hề được mở | $0.29 |
| R2 | opus-5-5 | như trên | Như R1 | $0.64 |
| R3 | sonnet | dòng override được nối thêm: "and open this run's trace per `shared/run-trace.md`" | Đã kiểm tra override; `run-trace.md` không hề được mở; không có trace | $0.34 |
| R4 | sonnet | một dòng riêng nêu đường dẫn trace và ba thời điểm | Mở `run-trace.md` và `team-roles.md`; thao tác ghi exclude bị một hook trên máy này chặn; không ghi trace và nói rõ điều đó trong một dòng, đúng như file yêu cầu | $0.44 |
| R5 | sonnet | như R4, tắt hook đó trong lúc chạy | Làm theo file; Claude Code từ chối sửa `.git/info/exclude` vì đó là file nhạy cảm; không ghi trace và nói rõ điều đó | $0.31 |
| R6 | sonnet | như R4, dùng file ignore của design này thay cho dòng exclude | Ghi file ignore và một trace 8 dòng, 520 byte; `git status` không liệt kê gì; thông điệp kết thúc nêu tên cả hai file | $0.36 |

Trace mà R6 đã ghi:

```
skill: help | kit: unknown | harness: claude-code | way: session | flags: (none)
subject: state | branch: main | start: d76e7cc | profile: absent | override: none
23:57 step 1 pick the mode: ran, state (no argument)
23:58 step 2 read the kit: ran, 25 skills read from skills/*/SKILL.md
23:58 step 3 read the project: ran, no .atk, docs, plans; tree clean; no tags; no pull request source checked
23:59 step 4 match: ran, row 19 holds (no conventions recorded)
23:59 step 5 answer: ran
end: no artifact: help writes none
```

Trong đó có ba chỗ sai, và không chỗ nào là lý do để đổi cách tiếp cận: `kit: unknown` dù có một
manifest nằm ngay cạnh skill, "25 skills" trong khi thực tế có 24, và `way: session` cho một lượt
chạy do agent khác khởi động ở chế độ headless. Chúng được đưa vào file định nghĩa dạng, ở mục Những
gì thay đổi.

Mỗi biến thể chạy một lần là bằng chứng cho một hướng đi, không phải một tỉ lệ. Bước 5 của giai đoạn
1 trong plan vẫn chạy ba skill có độ dài khác nhau và `atk:help` trên Codex trước khi phát hành.

## Tiêu chí quyết định

1. **Lượt chạy không ai theo dõi đi tới được** (AC1, AC2), dựa trên bằng chứng ở trên chứ không dựa
   trên lập luận.
2. **Không bao giờ được stage** (AC5), kể cả với một `.gitignore` của dự án phủ định `docs/derived/`.
3. **Hợp với kit**: không có quy tắc nào nằm trong hook, giữ tầng DRY, giữ giới hạn 300 dòng.
4. **Chi phí** tính bằng số dòng trên 24 skill và bằng những gì mọi lượt chạy phải đọc.

## Các phương án: cách một lượt chạy đi tới chỗ ghi trace

### A. Chỉ quy tắc 10 (design bị thay thế)

- Đi tới được: **không**, R1 và R2.
- Hợp với kit: gọn nhất; không `SKILL.md` nào thay đổi.

### B. Nhắc trong chính phần văn xuôi của skill

- Đi tới được: **không**. R1 và R2 chạy khi `help/SKILL.md:24` đã nêu tên quy tắc 10.

### C. Nối thêm vào dòng override để trỏ tới file trace

- Đi tới được: **không**, R3. Nửa câu nêu một đường dẫn cụ thể cần kiểm tra thì được làm; nửa câu
  bảo người đọc sang một file khác thì không.
- Hợp với kit: không thêm dòng mới nào vào `SKILL.md`.

### D. Một dòng riêng trong mọi workflow, nêu đường dẫn và ba thời điểm (được chọn)

- Đi tới được: **có**, R4 tới R6, lượt nào cũng mở `run-trace.md` và làm đúng những gì file nói, kể
  cả việc từ chối.
- Hợp với kit: mỗi `SKILL.md` một cặp dòng, 48 dòng trên toàn kit; quy trình vẫn nằm trong
  `shared/run-trace.md`, nên không có gì bị nhắc lại. `review` và `verify` phải bớt được hai dòng.

### E. Một hook ghi hoặc khởi động trace

- Đi tới được: **không**, trong những trường hợp quan trọng. Hook `PreToolUse` với matcher `Skill`
  chạy khi model gọi công cụ Skill, không phải khi một người tự gõ lệnh, và Cursor không có sự
  kiện tương ứng. Nó còn biến một hook thành con đường duy nhất dẫn tới một hành vi, điều `CLAUDE.md`
  cấm.

### F. Viết toàn bộ quy trình vào mọi `SKILL.md`

- Đi tới được: có lẽ được, chưa thử.
- Hợp với kit: **không đạt**. Hai mươi bốn bản chép của cùng một quy trình, và đã có hai skill chạm
  giới hạn.

| Tiêu chí | A | B | C | D | E | F |
|-----------|---|---|---|---|---|---|
| 1. Đi tới được | không | không | không | có, 3 trên 3 | không, với lệnh gõ tay | chưa thử |
| 3. Hợp với kit | có | có | có | có, 48 dòng | phá quy tắc về hook | 24 bản chép |
| 4. Chi phí | không có | không có | không có | 2 dòng mỗi skill | nhỏ | lớn |

## Các phương án: cách giữ trace ngoài git

### A. Một dòng trong file exclude cục bộ (design bị thay thế)

- Không bao giờ được stage: có, nhưng một phép phủ định trong `.gitignore` của dự án sẽ lấn át nó,
  và đó là lý do có bước kiểm tra.
- Lượt chạy không ai theo dõi đi tới được: **không**, R5. Claude Code hỏi trước khi sửa
  `.git/info/exclude`, và lượt chạy headless không trả lời được, nên một subagent hay một lượt chạy
  trong pane lần nào cũng trượt bước kiểm tra, cho tới khi có một lượt chạy tương tác nào đó đã ghi
  dòng này trong bản clone đó.

### B. `.gitignore` chứa `*` bên trong `<docs root>/derived/traces/` (được chọn)

- Không bao giờ được stage: có, và chắc hơn A. Mẫu trong một `.gitignore` nằm sâu hơn trong cây thư
  mục được ưu tiên hơn mẫu ở cấp cao hơn, nên `!docs/derived/**` trong `.gitignore` ở gốc dự án không
  với tới các trace, và `*` khớp cả chính file ignore, nên file đó cũng không bao giờ được stage. Đã
  kiểm tra trong một repository nháp ngày 2026-10-13: `git check-ignore -q` qua được trên một trace
  và trên file ignore khi có phép phủ định đó, và `git add .` không stage cái nào. `git add -f` vẫn
  stage được một trace, giống như ở A.
- Đi tới được: có, R6. Đây là một file của working tree, và ghi nó không cần quyền nào mà lượt chạy
  headless không có.
- Chi phí: một file trong working tree của người dùng mà git không hiển thị, trong khi A ghi một dòng
  vào thư mục git của bản clone.

### C. Để trace ngoài repository, trong thư mục trạng thái của người dùng

- Không bao giờ được stage: hiển nhiên.
- Hợp với kit: **không đạt**. `atk:tailor --feedback --runs` đọc các lượt chạy của một dự án từ
  chính dự án đó; trace nằm cạnh người dùng thay vì cạnh dự án sẽ trộn lẫn các dự án và không đến được
  bản clone của đồng đội, mà chẳng được lợi gì.

## Cách tiếp cận được chọn

### Dòng trong workflow

Mọi `SKILL.md`, ngay dưới dòng override ở đầu `## Workflow`:

```
Then, before anything else, create this run's trace, `<docs root>/derived/traces/<skill>/<run-id>.md`:
read `shared/run-trace.md` and do what it says before the file, at each step, and at the close.
```

với `<skill>` được viết ra thành tên thư mục, giống cách dòng override nêu tên file của chính nó.
Điều kiện `Run trace: off` vẫn nằm trong `shared/run-trace.md`, nên `SKILL.md` của một skill
`Not needed` không nêu tên profile. Câu chữ này chính là câu R4 tới R6 đã chạy; đổi câu chữ là đổi
thứ đã được thử.

Quy tắc 10 của `team-roles.md` vẫn là nghĩa vụ, và vẫn nằm trong danh sách những gì override không
được bỏ. Giờ nó nói rằng workflow của mọi skill đều mở trace, nên người đọc quy tắc tìm được chỗ nó
được thực hiện. Một skill mới mang dòng này ngay từ commit đầu tiên, và `CLAUDE.md` thêm điều đó vào
những gì một skill mới phải khớp.

### File ignore

`shared/run-trace.md`, mục "Where it lives", thay dòng exclude bằng file ignore:

- Trước bước đầu tiên, lượt chạy bảo đảm `<docs root>/derived/traces/.gitignore` tồn tại và chứa
  dòng `*`, tạo thư mục và file nếu thiếu, còn file đã có thì để nguyên.
- `git check-ignore -q <trace path>` vẫn bắt buộc. Giờ nó chỉ thất bại khi docs root không nằm trong
  repository git nào, và khi đó lượt chạy không ghi trace và nói rõ trong một dòng, như trước.
- Thông điệp kết thúc nêu tên file ignore nếu lượt chạy đã tạo ra nó.
- Chính sách giữ lại và `atk:tailor --runs` vẫn chỉ tác động lên những trace mà bước kiểm tra xác
  nhận là đã bị ignore.

Progress log giữ dòng exclude của nó; nó nằm ngoài bản design này. Trong một lượt chạy headless của
`atk:fix`, `atk:verify` hay `atk:implement`, nó gặp đúng rủi ro đó; điều này được ghi lại ở đây cho
người sở hữu file đó và không được sửa.

### Các mục được chỉ định

| Mục | Trả lời |
|---------|--------|
| Mô hình dữ liệu và migration | N/A. Không có kho dữ liệu. Bản clone đã có dòng exclude từ một bản build của branch thì giữ nguyên; dòng đó ignore cùng thư mục và được xóa bằng tay |
| Hợp đồng API | N/A. Không đổi so với design bị thay thế |
| Lỗi và trường hợp biên | File ignore đã tồn tại với nội dung khác: để nguyên, và bước kiểm tra quyết định. Không phải repository git: không có trace, một dòng. Harness từ chối ghi file ignore: bước kiểm tra thất bại, không có trace, một dòng |
| Tương thích ngược | Không skill nào đổi thứ nó tạo ra. Dòng này là phần thêm vào ở đầu mỗi workflow |
| Triển khai | Không đổi: một bản phát hành patch `feat:` gồm cả hai giai đoạn của plan |
| Quay lui | Revert pull request duy nhất của plan. File ignore và các trace còn lại trong working tree bị git bỏ qua và bị xóa cùng thư mục |
| Khả năng quan sát | Chính trace là khả năng quan sát |
| Bảo mật và quyền | AC5 được giữ chắc hơn so với design bị thay thế, vì phép phủ định ở gốc không còn với tới các trace. Không ghi gì vào thư mục git |
| Hiệu năng | R6: 8 dòng, 520 byte, khoảng 130 token nếu ước 4 byte một token. Mỗi lượt chạy có trace còn đọc `shared/run-trace.md`, 8,869 byte trên branch, khoảng 2,200 token theo cùng cách ước, và R4 tới R6 còn đọc cả `team-roles.md`, 10,562 byte. Đo đúng cách, trên ba skill và Codex, ở bước 5 của giai đoạn 1 |

## Những gì thay đổi

So với design bị thay thế và branch `feat/run-trace` ở trạng thái hiện tại:

- **Cả 24 file `plugins/atk/skills/<name>/SKILL.md`:** dòng workflow gồm hai dòng. `review` và
  `verify` mỗi file bớt được hai dòng để ở dưới 300.
- **`plugins/atk/shared/run-trace.md`:** file ignore thay cho dòng exclude; và từ R6, `kit` được đọc
  từ `../../.claude-plugin/plugin.json` tính từ `SKILL.md` trước khi ghi `unknown`, và một lượt chạy
  mà nhiệm vụ đến mà không có người nào trong hội thoại thì không phải `session`.
- **`plugins/atk/shared/team-roles.md`, quy tắc 10:** nêu dòng workflow là chỗ quy tắc được thực hiện.
- **`CLAUDE.md`:** thứ tự các mục của `SKILL.md` nêu dòng workflow cạnh dòng override, để skill mới
  khớp theo; hàng và đoạn văn của `run-trace.md` trong phần `shared/` nói lượt chạy đi tới nó bằng
  cách nào.
- **Plan** `plans/261012-0052-run-trace/` nhận những điều này như một bản sửa cho giai đoạn 1, trước
  khi chạy lại bước 5.

## Truy vết

| Tiêu chí | Đáp ứng bởi |
|-----------|--------|
| AC1 | Dòng workflow, R6 |
| AC2 | Dòng workflow, và file ignore mà lượt chạy headless ghi được, R6. Các lượt chạy subagent, Codex và orchestrate theo plan |
| AC3 tới AC6 | Không đổi so với design bị thay thế; AC5 được file ignore làm chắc hơn |

## Quyết định đã ghi nhận

Đề xuất, và mỗi điều chờ người duyệt:

- Trace được khởi động bằng một dòng trong mọi `SKILL.md`, không chỉ bằng quy tắc 10.
- Trace được giữ ngoài git bằng một file ignore nằm trong thư mục của nó, không phải bằng file exclude
  cục bộ.

## Câu hỏi mở

Không có.

## Người review

- Tech Lead: Lam Ngoc Khuong, người duyệt. `.atk/profile.md` không liệt kê BrSE hay SRE nào cho
  repository này.

ADR: `docs/adr/0005-run-trace-started-from-the-workflow.md`, thay cho
`docs/adr/0004-every-skill-leaves-a-run-trace.md`.
