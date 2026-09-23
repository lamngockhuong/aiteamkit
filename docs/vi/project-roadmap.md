# Lộ trình dự án

## Trạng thái

| Phase | Trạng thái | Tóm tắt |
|-------|------------|---------|
| 1. Dựng khung kit | XONG | Repo, ba manifest, tự động hóa release, tài liệu song ngữ |
| 2. Độ phủ skill | XONG | 22 file `SKILL.md` phủ vòng đời, dùng chung một hợp đồng về bố cục mục |
| 3. Bổ sung reference | ĐANG LÀM | `references/` cho từng skill. Mười bốn skill đã có, tám skill còn lại chưa |
| 4. Eval trigger | XONG | `evals/trigger_evals.json` cho đủ 22 skill. Kit không kèm bộ chạy; cách đo nằm ở `docs/trigger-eval-measurement.md` |
| 5. Kiểm chứng thực địa | CHƯA BẮT ĐẦU | Chạy bộ kit trên một team dự án thật và sửa những chỗ vỡ |
| 6. Phát hành | CHƯA BẮT ĐẦU | Đưa lên marketplace của cả ba harness |

## Phase 1: Dựng khung kit (xong)

Bố cục repo theo đúng hình dạng một plugin đa harness đang chạy được: `.claude-plugin/`,
`.cursor-plugin/`, `.codex-plugin/`, `skills/`, `shared/`, `assets/`, `docs/` song ngữ,
release-please chạy khi push lên `main`, cùng các template issue và pull request của GitHub.

## Phase 2: Độ phủ skill (xong)

Hai mươi hai skill, mỗi skill một `SKILL.md` dưới 300 dòng theo cùng một hợp đồng bố cục:
frontmatter với trigger đa ngôn ngữ, scope, roles, invocation, workflow, output, ticket và
definition of done.

Mười hai skill phủ phần quy trình mà một team chạy quanh mã nguồn. Tám skill thêm về sau để kit phủ
luôn phần làm việc trên chính mã nguồn, và để kit dừng ở chỗ một vai trò nắm quyền quyết chứ không
dừng ở chỗ phải nhường cho kit khác: `init` ghi lại dự án này là gì, `catchup` giúp một người nắm
được phần việc họ không tham gia từ đầu, `plan` cắt một phần việc thành các phase có thể đem ra
duyệt, `implement` viết mã, `fix` chứng minh nguyên nhân của lỗi trước khi sửa một dòng, `verify`
chạy thật hệ thống lên để đối chứng, và `spec` giữ những tài liệu nói API, schema và từng tính năng
hôm nay làm gì.

`help` đến sau cùng. Nó không ghi gì và trả lời nên chạy skill nào trong số còn lại, đọc từ trạng
thái của dự án chứ không từ một danh sách, nên một skill thêm về sau là skill nó đã biết sẵn.

Lớp `shared/` giữ những gì lẽ ra phải lặp lại hai mươi hai lần: từ vựng vai trò, quy ước đường dẫn
artifact và các adapter tracker, đều được mọi skill trích dẫn. Mười file còn lại là hợp đồng giữa
những nhóm nhỏ hơn: `review-checklist.md` giữa `convention` và `review`, `finalize-steps.md` cùng
`layer-verification.md` giữa ba skill đổi mã nguồn, `diagram-conventions.md` giữa năm skill có
artifact mang sơ đồ, `host-capabilities.md` và `tidy-pass.md` quanh phần năng lực do chính harness
cung cấp, `spec-docs.md` giữa `spec` và năm skill có nghĩa vụ để tài liệu của nó đúng,
`host-file-locations.md` giữa `convention`, skill hỏi xem một file cộng tác có thiếu hay không,
`git`, skill phải tìm ra template pull request, và `init`, skill đọc định danh của cả đội trong
`CODEOWNERS`, `project-profile.md` mô tả `.atk/profile.md`, một file nằm trong dự án đích chứ không
nằm trong kit, và `project-overrides.md` mô tả
`.atk/overrides/<skill>.md`, tới được mọi skill qua luật 7 của `team-roles.md` chứ không phải nhờ
được trích dẫn thẳng.

## Phase 3: Bổ sung reference (đang làm)

Mười bốn skill đã có sẵn `references/`. Tám skill còn lại thì chưa. Chỗ nào output là tài liệu bố
cục cố định mà chưa reference nào giữ bố cục ấy, template phải suy ra lại mỗi lần chạy:

| Skill | Reference cần thêm |
|-------|--------------------|
| `intake` | Ngân hàng câu hỏi phỏng vấn. Template requirement đã xong: `skills/intake/references/requirement-template.md` |
| `estimate` | Các thang ước lượng kèm một ví dụ đã tính cho mỗi thang, và bảng tính capacity |
| `design-doc` | Template tài liệu thiết kế, template ADR, bộ tiêu chí so sánh phương án |
| `breakdown` | Schema bảng task và luật sở hữu file cho các làn song song |
| `qa` | Schema bảng test case, checklist case âm và biên theo từng kiểu input |
| `release` | Template checklist theo môi trường, quy tắc hành văn cho ghi chú gửi khách |
| `incident` | Thang mức nghiêm trọng, định dạng timeline, template postmortem |
| `retro` | Bộ lệnh thu thập bằng chứng từ git, CI và từng tracker |
| `convention` | Heuristic suy ra quy ước theo từng ngôn ngữ và framework |
| `handover` | Template tài liệu và ngân hàng câu hỏi phỏng vấn |

Ràng buộc giữ nguyên: `SKILL.md` dưới 300 dòng, chi tiết chuyển vào `references/`.

## Phase 4: Eval trigger (xong)

Mỗi skill một `evals/trigger_evals.json`, là mảng các `{query, should_trigger}` chia làm hai phần:
cách nói phải gọi đúng skill đó, và cách nói không được gọi nó. Mười hai file viết sau mang từ 20
đến 22 case; tám file viết trước trải từ 16 tới 31, vì chúng được cân từng cái một theo lúc skill
tương ứng ra đời. Những case đáng
giá là các cặp dễ nhầm giữa skill kề nhau, và giờ cặp nào cũng có file ở cả hai phía: `intake` với
`design-doc`, `plan` với `breakdown`, `fix` với `incident`, `review` với `qa`, `qa` với `verify`,
`onboard` với `handover`. Mỗi file đều phủ cả ba ngôn ngữ trigger, nên bỏ phần tiếng Việt hoặc tiếng
Nhật khỏi một `description` sẽ làm rớt case chứ không trôi qua im lặng.

Kit cố ý không kèm bộ chạy: thêm một slash command không sinh artifact, không có người duyệt, không
phải thứ kit này nhắm tới. Đo một case không đơn giản là chĩa một bộ chạy thông thường vào file, vì
nó báo ra một điểm số rỗng khi skill đã cài dưới dạng plugin;
[trigger-eval-measurement.md](trigger-eval-measurement.md) giữ cách đo được và những case không gì
quan sát nổi.

## Phase 5: Kiểm chứng thực địa

Chạy bộ kit với một team thật trọn một chu kỳ sprint. Dự kiến sẽ lộ ra: những câu phỏng vấn mà repo
đã trả lời được, những artifact không ai đọc, và những skill âm thầm quyết thay một vai trò. Loại
cuối cùng là lỗi, không phải sở thích.

## Phase 6: Phát hành

Đưa lên marketplace của Claude Code, Cursor và Codex sau khi phase 3 đến 5 đóng lại. Thoát giai đoạn
tiền 1.0 bằng cách bỏ hai cờ `bump-*-pre-major` trong `release-please-config.json`.

## Câu hỏi còn treo

- Team dùng Backlog hoặc Redmine có cần adapter thật gọi API không, hay bảng ánh xạ từ vựng cộng với
  copy tay là đủ?
- Có đáng thêm một skill nữa cho báo cáo ngày và tuần không, hay `atk:retro --report` đã phủ
  nhu cầu đó ở tần suất thưa hơn?
- Hook lúc mở phiên nay chạy trên Claude Code và trên Codex, hai file đăng ký cùng trỏ về một
  script. Bộ nạp file ghi đè cũng đã đăng ký trên Codex, và chưa ai thấy nó khớp một lần gọi skill
  nào ở đó. Cursor cũng đóng gói hook được; nuôi thêm một file đăng ký nữa có đáng không, khi cổng
  thật vốn nằm trong skill?
- `shared/project-profile.md` xếp `review`, `qa`, `release` và `convention` vào nhóm Required-soft,
  tức chạy tiếp khi thiếu profile và nói rõ điều đó trong artifact. `plan` và `convention` đã cài đặt
  luật này; `review`, `qa` và `release` không hề nhắc tới profile, nên với ba skill đó không có gì
  cài đặt. Hoặc bổ sung cho ba skill kia, hoặc chuyển chúng sang nhóm không cần profile.
