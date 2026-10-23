---
title: Team chọn model cho các agent mà atk sinh ra, thông qua profile
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-23
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-23, by instruction to the agent.

# Team chọn model cho các agent mà atk sinh ra, thông qua profile

Bản tiếng Việt để đọc cho tiện. Bản gốc là `docs/records/design/261022-0830-agent-model-from-profile.md`; khi hai bản khác nhau, bản
tiếng Anh là bản đúng.

## Tóm tắt

Hiện nay không skill `atk` nào và không agent `atk` nào nêu tên model. Mọi skill chạy trên model của
phiên, và mọi agent mà một skill sinh ra chạy trên model mà harness chọn khi không có tên nào được
nêu, tức là model của phiên, trừ khi người dùng đã đặt model mặc định cho subagent. Chi phí tăng
nhanh nhất không nằm ở phiên mà ở các agent: một lần `atk:review` sinh một agent cho mỗi round, và
`--parallel <N>` nhân số đó lên; `atk:design-doc --challenge` và `atk:plan --challenge` sinh một agent
cho mỗi lens; và bảy skill giao phần đọc rộng cho một agent.

Giờ cả ba harness đều cho bên gọi nêu tên model khi sinh agent. Bản design này thêm hai dòng tùy chọn
vào mục Team của `.atk/profile.md`: một dòng cho các agent đọc rộng và một dòng cho các agent của một
lần review hay một lần challenge, mỗi dòng nêu một model cho từng harness. Skill truyền model đã nêu
khi sinh loại agent tương ứng, và không truyền gì khi thiếu dòng hay thiếu harness, đúng y hành vi
hiện nay. Kit không bao giờ tự chọn model, không bao giờ đổi model của phiên, và không bao giờ đổi
model của agent có ghi file hay của reviewer band 1.

## Yêu cầu

Chưa có artifact yêu cầu: yêu cầu đến từ người bảo trì trong cuộc trao đổi ngày 2026-10-22, hỏi
`atk` có nên gán hay gợi ý model cho từng việc để giảm chi phí không. Các tiêu chí dưới đây được nêu
lại từ cuộc trao đổi đó, và bản design này được đối chiếu với chúng.

1. **Đội quyết định, kit thì không.** Agent chạy trên model nào là một đánh đổi giữa chi phí và chất
   lượng thuộc về một vai trò, theo `plugins/atk/shared/team-roles.md`. Kit không phát hành tên model
   nào làm mặc định và không bao giờ tự hạ model.
2. **Không có dòng thì không đổi gì.** Dự án không ghi gì thì giữ hành vi hiện nay trên mọi harness.
3. **Đọc và review được chọn riêng.** Đọc rộng trả về kết luận mà phiên kiểm tra lại; một round review
   trả về finding mà một người sẽ xử lý. Đội phải hạ được model của cái thứ nhất mà không hạ cái thứ
   hai.
4. **Giảm cấp, không bao giờ dừng.** Harness không nêu được model cho từng agent thì sinh agent như
   hiện nay, và lượt chạy nói rằng dòng đó không được áp dụng, theo mục "When the capability is
   missing" trong `plugins/atk/shared/host-capabilities.md`.
5. **Người đọc nhìn thấy được.** Lượt chạy đã áp dụng một dòng thì nói nó đã yêu cầu model nào, ở
   đúng chỗ nó vốn đã nêu những gì nó sinh ra.

## Hiện trạng

**Không nơi nào trong kit nêu tên model.** `plugins/atk/agents/read-only-reviewer.md:1-6` có `name`,
`description`, `tools: Read, Grep, Glob` và `readonly: true`, không có `model`. Không `SKILL.md` nào
của cả hai plugin có trường `model` trong frontmatter. Chỗ duy nhất nhắc tới chọn model là
`atkx:skill-eval --trigger --model <id>` (`plugins/atkx/skills/skill-eval/SKILL.md:14,64-65`), dùng
để chọn model chạy phép đo trigger, không phải model làm việc của một skill.

**Những chỗ kit sinh agent.**

| Ai sinh | Agent | Quy tắc nằm ở đâu |
|------------|-------|-------------------|
| `atk:review` | một agent mỗi round, các bản sao khi có `--parallel`, lượt quét | `plugins/atk/shared/host-capabilities.md:202-270`, `plugins/atk/skills/review/references/review-rounds.md` |
| `atk:review`, band 1 | một agent tổng quát chạy toàn bộ review và viết báo cáo | `plugins/atk/skills/review/references/review-rounds.md:172-187` |
| `atk:design-doc --challenge`, `atk:plan --challenge` | một agent mỗi lens | `plugins/atk/shared/independent-challenge.md`, qua `host-capabilities.md:202-208` |
| `init`, `catchup`, `spec`, `convention`, `security`, `fix`, `onboard` | một agent đọc rộng và trả về kết luận | `plugins/atk/shared/host-capabilities.md:272-296` |
| `atk:orchestrate` | các agent có ghi file, trong pane, subagent hay chính phiên | `plugins/atk/shared/host-capabilities.md:297-385`, `plugins/atk/skills/orchestrate/references/ways-to-run.md` |

Trên Claude Code, mọi agent chỉ đọc đều được sinh dưới dạng `atk:read-only-reviewer`
(`host-capabilities.md:235-243`), nên model nêu trong frontmatter của agent đó sẽ áp lên tất cả cùng
lúc: round, lens và đọc rộng như nhau. Vì thế file agent không đáp ứng được tiêu chí 3.

**Lượt chạy vốn đã nêu những gì nó sinh ra.** `host-capabilities.md:219-225` bắt lượt chạy nêu số
lượt và số agent trước khi sinh agent đầu tiên, và `review-rounds.md:276-288` đưa ra dòng mà
`atk:review` in. Dòng đó là chỗ tự nhiên để nói model nào đã được yêu cầu.

**Mỗi harness cho phép gì, theo tài liệu của nó, đọc ngày 2026-10-22.**

| Harness | Nêu model khi sinh agent | Model trong file agent | Mặc định cho mọi subagent |
|---------|----------------------------|-------------------------|----------------------------|
| Claude Code | có, tham số `model` của công cụ `Agent`; được ưu tiên đầu tiên | `model:` trong frontmatter của agent, cho phép `inherit` | `CLAUDE_CODE_SUBAGENT_MODEL`, chỉ dùng khi cả hai cách trước đều không đặt; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` lấn át cả hai |
| Cursor | có, "The parent agent can name a model when it launches a subagent" | `model: inherit` hoặc một model ID, mặc định `inherit` | tài liệu không nói |
| Codex | có, giá trị nêu khi sinh lấn át các mặc định | `model` trong TOML của một agent tùy chỉnh, thắng giá trị nêu khi sinh | `agents.default_subagent_model` trong `config.toml` |

Nguồn: `https://code.claude.com/docs/en/sub-agents`, `https://cursor.com/docs/subagents`,
`https://learn.chatgpt.com/docs/agent-configuration/subagents.md`, mỗi nguồn đọc ngày 2026-10-22.
Không điều nào ở đây được đo tại repository này. Diễn đàn của Cursor ghi nhận hai báo cáo còn mở về
việc model của subagent không được tôn trọng; plugin của Codex không kèm agent nào
(`docs/system-architecture.md:122-124`), nên trên Codex các agent của kit là agent tổng quát, và chỉ
giá trị nêu khi sinh hoặc mặc định toàn cục mới tác động được tới chúng.

**Profile giữ các dòng làm thay đổi hành vi ở đâu.** `plugins/atk/shared/project-profile.md:200-241`
liệt kê các mục trong phần Docs làm thay đổi những gì một skill làm, trong đó có `Run trace: off`, một
dòng mà khi vắng mặt cũng mang nghĩa và không bao giờ được ghi `TBD`. Mục Team
(`project-profile.md:190`) được mọi skill đọc, kể cả nhóm `Not needed`, để lấy tên trên các dòng
`gate` (`plugins/atk/shared/run-trace.md:33-35`).

## Các phương án

Tiêu chí, theo thứ tự trọng số: tiền đề về đội (tiêu chí 1), tách đọc khỏi review (tiêu chí 3), hành
vi trên ba harness, công sức, khả năng đảo ngược, và mức bất ngờ khi agent không chạy trên model mà
người dùng tưởng.

### A. Hai dòng tùy chọn trong mục Team, truyền vào lúc sinh agent (được chọn)

Profile nêu, cho từng harness, model của các agent đọc rộng và model của các agent thuộc một lần
review hay challenge. Skill truyền model đó vào lúc sinh agent.

- Tiền đề: dòng này là của đội, do một người viết và được duyệt cùng profile. Đạt.
- Tách riêng: hai dòng, hai loại. Đạt.
- Harness: theo tài liệu, cả ba đều nhận model lúc sinh agent. Trên Codex, giá trị nêu khi sinh thua
  một file agent tùy chỉnh có đặt `model`, mà kit không phát hành file nào như vậy. Đạt, chưa đo.
- Công sức: hai file dùng chung, template và phần dò tìm của init, dòng của review rounds, tài liệu
  kiến trúc hệ thống và `CLAUDE.md`. Không có file mới.
- Đảo ngược được: xóa các dòng đi.
- Bất ngờ: trên Claude Code và Codex, giá trị nêu khi sinh được ưu tiên hơn mặc định cho subagent mà
  chính người dùng đặt. Người đã đặt `CLAUDE_CODE_SUBAGENT_MODEL` sẽ thấy nó bị lấn át cho các agent
  của kit, nhưng chỉ khi đội đã nêu model cho harness của họ; không có dòng thì mặc định của họ vẫn
  áp dụng. Tổng số được nêu có ghi tên model, nên việc lấn át này nhìn thấy được.

### B. Ghi tài liệu về mặc định cho subagent của chính harness, không đổi skill nào

Đội commit `CLAUDE_CODE_SUBAGENT_MODEL` trong `.claude/settings.json` của dự án, hoặc
`agents.default_subagent_model` trong cấu hình của Codex, và kit chỉ ghi tài liệu về điều đó. Đây là
phương án một đội sẽ nghĩ tới đầu tiên, vì nó không tốn gì.

- Tiền đề: đội quyết định qua một file được commit. Đạt.
- Tách riêng: một giá trị cho mọi subagent của harness, không chỉ của kit: reviewer, agent đọc, và mọi
  agent mà `atk:orchestrate` chạy dưới dạng subagent, vốn viết code. Hạ model của một agent viết code
  để tiết kiệm phần đọc là ngược với ý định. Không đạt.
- Harness: Cursor không có mặc định toàn cục nào trong tài liệu. Một phần.
- Công sức: chỉ tài liệu.
- Phương án này thua ở tiêu chí tách riêng, và A không lấy mất nó: người dùng vẫn dùng được, và nó áp
  dụng ở mọi chỗ profile không nói gì.

### C. Phát hành thêm một agent chỉ đọc với model rẻ hơn trong frontmatter

`atk:read-only-reader` với `model: haiku`, dùng cho đọc rộng, trong khi reviewer vẫn thừa hưởng model
như cũ.

- Tiền đề: kit chọn model. Không đạt, và chỉ thế là đủ loại phương án này.
- Harness: tên `haiku` không có nghĩa gì trên Cursor hay Codex, và plugin của Codex không mang agent.
- Nó còn đóng băng một tên model trong file phát hành, tên đó sẽ cũ đi mỗi khi có model mới ra.

### D. Một trường `model:` trong mỗi `SKILL.md`

- Tiền đề: kit chọn, và trên Claude Code nó đổi chính model của phiên trong lượt đó, nên người đã chọn
  model mạnh cho một lần sửa lỗi khó sẽ bị chuyển sang model yếu hơn mà không được hỏi. Không đạt.
- Harness: Cursor và Codex không có trường này trong tài liệu về skill.

## Cách tiếp cận được chọn

Phương án A.

### Hai dòng

Trong mục Team của `.atk/profile.md`, sau `Working language`:

```markdown
- Reading agent model: claude-code sonnet; codex <a model ID Codex accepts>
- Review agent model: inherit
```

- **Reading agent model** áp dụng cho agent đọc rộng, theo mục "Reading wide, through an agent" trong
  `plugins/atk/shared/host-capabilities.md`.
- **Review agent model** áp dụng cho mọi agent mà một lần review sinh ra, trừ reviewer band 1: các
  round, các bản sao khi có `--parallel`, lượt quét, và mọi lens của `--challenge`.
- Giá trị là danh sách các cặp `<harness> <model>` cách nhau bằng `;`, hoặc `inherit`. Tên harness là
  những tên mà phần đầu run trace ghi: `claude-code`, `cursor`, `codex`. Model là bất cứ tên nào
  harness đó nhận lúc sinh agent, một bí danh như `sonnet` hay một model ID đầy đủ, chép đúng như đội
  viết; kit không giữ bảng model nào và không kiểm tra tên nào.
- Thiếu dòng, `inherit`, hay một harness mà dòng không nêu đều có nghĩa là không truyền model nào,
  tức hành vi hiện nay. Giống `Run trace`, dòng này không bao giờ được ghi `TBD`: vắng mặt cũng là một
  câu trả lời.

Đặt ở mục Team chứ không ở Docs, vì lựa chọn này là quyết định về chi phí của đội, cùng loại với ai
duyệt cái gì, và vì mọi skill vốn đã đọc Team, kể cả nhóm `Not needed`, nên không skill nào phải đọc
thêm.

### Skill làm gì

1. Đọc hai dòng cùng phần còn lại của profile, một lần mỗi lượt chạy, theo mục "How a skill cites it"
   trong `plugins/atk/shared/project-profile.md`. Skill không sinh agent nào thì bỏ qua chúng.
2. Khi sinh một agent chỉ đọc, tìm dòng của loại agent đó và cặp ứng với harness mà phần đầu run trace
   nêu. Nếu có, truyền model đó lúc sinh; nếu không, không truyền gì.
3. Trong dòng nêu những gì lượt chạy sẽ sinh ra, `host-capabilities.md:219-225` và dạng của nó trong
   `review-rounds.md:276-288`, thêm model đã yêu cầu, hoặc không thêm gì khi không truyền model nào.
   Với đọc rộng, nêu điều này ở chỗ artifact liệt kê những gì đã đọc, hoặc trong thông điệp kết thúc,
   những chỗ `host-capabilities.md:293-296` vốn đã dùng.
4. Khi harness không có cách nêu model lúc sinh agent, sinh như hiện nay và nói ở cùng chỗ đó: dòng
   đã nêu `<model>` cho harness này, model đó không truyền được, và agent đã chạy theo lựa chọn của
   chính harness.
5. Nếu harness từ chối sinh agent vì model, do tên không rõ hay do danh sách cho phép của tổ chức chặn, thì
   thử lại một lần không kèm model, và lượt chạy nói điều đó ở cùng chỗ. Claude Code âm thầm thay
   model bị chặn; lượt chạy không thấy được điều này, nên nó nói model nó đã yêu cầu, không phải model
   đã chạy.

### Không bao giờ áp dụng cho

- **Phiên.** Kit không bao giờ đổi model mà người dùng đang chạy nó.
- **Reviewer band 1.** Agent này nhận các phán quyết và viết báo cáo (`review-rounds.md:172-187`);
  `host-capabilities.md:266-267` giữ phần này cho agent gọi, nên nó chạy trên mặc định của harness,
  giống phiên, vốn sẽ tự làm phần này nếu không có nó.
- **Agent có ghi file**, tức mọi job của `atk:orchestrate`. Job của nó đưa code tới một commit; đội
  muốn dùng model rẻ hơn ở đó thì chọn CLI của agent và các cờ của nó trong bản đề xuất, và người
  dùng vốn đã duyệt bản đề xuất đó theo mục "Agents that write".

### Mô hình dữ liệu và migration

`N/A` về dữ liệu. Profile có thêm hai dòng tùy chọn; profile không có chúng vẫn hợp lệ và không đổi.

### Hợp đồng API

`N/A`. Hợp đồng thay đổi là của profile: hai dòng trong mục Team, mô tả ở trên, do
`plugins/atk/shared/project-profile.md` sở hữu.

### Lỗi và trường hợp biên

- Dòng có cặp cho một harness mà lượt chạy không chạy trên đó: bỏ qua trong lượt chạy này.
- Giá trị sai dạng, không có tên harness, hay một cặp không có model: coi như không có dòng, và lượt
  chạy nói trong thông điệp kết thúc rằng không đọc được dòng đó, nêu tên dòng và không đoán.
- Cùng một harness được nêu hai lần: cặp đầu tiên thắng, và lượt chạy nói cặp thứ hai đã bị bỏ qua.
- Mặc định cho subagent mà người dùng đặt trên harness: không bị ảnh hưởng ở mọi chỗ không truyền
  model.

### Tương thích ngược

Tương thích hoàn toàn. Không có dòng nghĩa là không truyền model, và đó là tình trạng của mọi dự án
hiện nay.

### Triển khai

Một pull request mang các file dùng chung, các thay đổi của init và tài liệu. `atk:init` không bao giờ
hỏi các dòng này và không bao giờ tự ghi chúng khi chưa được yêu cầu, giống cách nó xử lý `Run trace`
(`plugins/atk/skills/init/SKILL.md:94-100`): template có một chú thích nói các dòng đặt ở đâu và vắng
mặt nghĩa là theo lựa chọn của phiên. `--audit` không báo chúng bị thiếu.

### Quay lui

Revert pull request. Profile đã giữ các dòng vẫn hợp lệ: khi không còn quy tắc, không gì đọc chúng.

### Khả năng quan sát

Tổng số được nêu của một lượt chạy có ghi model đã yêu cầu, và mục `## Rounds` của báo cáo review,
nơi mang tổng số đó, giữ lại thông tin này. Run trace không có thêm gì: sáu loại sự kiện của nó đã cố
định (`run-trace.md:171-185`), và model là một sự việc của lần sinh agent, không phải một sự kiện.

### Ảnh hưởng tới bảo mật và quyền

Không ảnh hưởng gì tới những gì agent được phép làm. Danh sách công cụ của `atk:read-only-reviewer` và
các quy tắc prompt của `host-capabilities.md` vẫn giữ, dù model nào chạy chúng. Tên model không phải
bí mật và có thể nằm trong một file được commit.

### Kỳ vọng về hiệu năng

Chi phí của một lần review giảm theo tỉ lệ với giá của model mà đội nêu cho các round, vì round chiếm
phần lớn token của một lần review; phần của phiên không đổi. Model rẻ hơn có bỏ sót finding mà model
mạnh hơn tìm ra hay không là câu hỏi bản design này không trả lời được. Tech Lead cho phép dòng
review dù chưa đo, theo câu trả lời của Q1, nên dòng nêu tổng số agent và báo cáo review ghi tên model
là chỗ để người đọc cân nhắc các finding của một lần review.

### Các file mà phần triển khai chạm tới

- `plugins/atk/shared/project-profile.md`: hàng Team trong Sections, và hai dòng đặt cạnh các mục làm
  thay đổi hành vi.
- `plugins/atk/shared/host-capabilities.md`: gạch đầu dòng về tổng số được nêu và mục Reading wide,
  các bước 2 tới 5 ở trên; gạch đầu dòng về reviewer, cho biết dòng review bao gồm những agent nào.
- `plugins/atk/skills/review/references/review-rounds.md`: dòng chi phí nêu tên model.
- `plugins/atk/shared/independent-challenge.md`: một câu, rằng agent của lens dùng dòng review.
- `plugins/atk/skills/init/references/profile-template.md` và `references/detection.md`: chú thích,
  và việc các dòng không bao giờ được hỏi.
- `docs/system-architecture.md` và `docs/vi/system-architecture.md`: hàng profile của bảng nạp, và
  đường đi trên từng harness, riêng Cursor ghi là theo tài liệu đọc ngày 2026-10-22, chưa đo, theo câu
  trả lời của Q2.
- `CLAUDE.md`: hàng `project-profile.md` trong bảng dùng chung.

## Câu hỏi mở

Không còn câu nào.

### Đã trả lời

| Câu hỏi | Câu trả lời | Người trả lời | Ngày | Người chuyển lời |
|---|---|---|---|---|
| Q1. Dòng review có được nêu model rẻ hơn không, hay chỉ dòng đọc mới được? | "Cho cả hai dòng", chọn phương án được đưa ra trong phiên: giữ design như đã viết, team quyết cả dòng đọc lẫn dòng review, và báo cáo review ghi model đã dùng | Lam Ngoc Khuong | 2026-10-22 | |
| Q2. Cursor có tôn trọng model nêu lúc sinh agent cho agent của plugin không? | "Ghi theo tài liệu", chọn phương án được đưa ra trong phiên: chưa đo lúc này; `docs/system-architecture.md` ghi đường đi trên Cursor là theo tài liệu đọc ngày 2026-10-22, chưa đo | Lam Ngoc Khuong | 2026-10-22 | |

ADR: `docs/adr/0009-agent-model-chosen-by-the-team-in-the-profile.md`
