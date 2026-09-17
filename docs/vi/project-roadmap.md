# Lộ trình dự án

## Trạng thái

| Phase | Trạng thái | Tóm tắt |
|-------|------------|---------|
| 1. Dựng khung kit | XONG | Repo, ba manifest, tự động hóa release, tài liệu song ngữ |
| 2. Độ phủ skill | XONG | 18 file `SKILL.md` phủ vòng đời, dùng chung một hợp đồng về bố cục mục |
| 3. Bổ sung reference | ĐANG LÀM | `references/` cho từng skill. Sáu skill thực thi đã có, mười hai skill gốc chưa |
| 4. Eval trigger | ĐANG LÀM | `evals/trigger_evals.json` cho từng skill. Sáu skill thực thi đã có, mười hai skill gốc chưa. Vẫn thiếu bộ chạy |
| 5. Kiểm chứng thực địa | CHƯA BẮT ĐẦU | Chạy bộ kit trên một team dự án thật và sửa những chỗ vỡ |
| 6. Phát hành | CHƯA BẮT ĐẦU | Đưa lên marketplace của cả ba harness |

## Phase 1: Dựng khung kit (xong)

Bố cục repo theo đúng hình dạng một plugin đa harness đang chạy được: `.claude-plugin/`,
`.cursor-plugin/`, `.codex-plugin/`, `skills/`, `shared/`, `assets/`, `docs/` song ngữ,
release-please chạy khi push lên `main`, cùng các template issue và pull request của GitHub.

## Phase 2: Độ phủ skill (xong)

Mười tám skill, mỗi skill một `SKILL.md` dưới 300 dòng theo cùng một hợp đồng bố cục: frontmatter với
trigger đa ngôn ngữ, scope, roles, invocation, workflow, output, ticket và definition of done.

Mười hai skill phủ phần quy trình mà một team chạy quanh mã nguồn. Sáu skill thêm về sau để kit phủ
luôn phần làm việc trên chính mã nguồn, và để kit dừng ở chỗ một vai trò nắm quyền quyết chứ không
dừng ở chỗ phải nhường cho kit khác: `init` ghi lại dự án này là gì, `catchup` giúp một người nắm
được phần việc họ không tham gia từ đầu, `plan` cắt một phần việc thành các phase có thể đem ra
duyệt, `implement` viết mã, `fix` chứng minh nguyên nhân của lỗi trước khi sửa một dòng, và `verify`
chạy thật hệ thống lên để đối chứng.

Lớp `shared/` giữ những gì lẽ ra phải lặp lại mười tám lần: từ vựng vai trò, quy ước đường dẫn
artifact và các adapter tracker, đều được mọi skill trích dẫn. Bốn file còn lại là hợp đồng giữa
những nhóm nhỏ hơn: `review-checklist.md` giữa `convention` và `review`, `finalize-steps.md` cùng
`layer-verification.md` giữa ba skill có sửa mã, và `project-profile.md` mô tả `.atk/profile.md`,
một file nằm trong dự án đích chứ không nằm trong kit.

## Phase 3: Bổ sung reference (đang làm)

Sáu skill thực thi đã có sẵn `references/`. Mười hai skill gốc thì chưa. Với những skill có output là
tài liệu bố cục cố định, template phải suy ra lại mỗi lần chạy:

| Skill | Reference cần thêm |
|-------|--------------------|
| `intake` | Template story và tiêu chí nghiệm thu, ngân hàng câu hỏi phỏng vấn |
| `design-doc` | Template tài liệu thiết kế, template ADR, bộ tiêu chí so sánh phương án |
| `qa` | Schema bảng test case, checklist case âm và biên theo từng kiểu input |
| `release` | Template checklist theo môi trường, quy tắc hành văn cho ghi chú gửi khách |
| `incident` | Thang mức nghiêm trọng, định dạng timeline, template postmortem |
| `retro` | Bộ lệnh thu thập bằng chứng từ git, CI và từng tracker |
| `convention` | Heuristic suy ra quy ước theo từng ngôn ngữ và framework |
| `onboard`, `handover` | Template tài liệu và ngân hàng câu hỏi phỏng vấn |

Ràng buộc giữ nguyên: `SKILL.md` dưới 300 dòng, chi tiết chuyển vào `references/`.

## Phase 4: Eval trigger

Mỗi skill một `evals/trigger_evals.json`, là mảng các `{query, should_trigger}`. Sáu skill thực thi
đã có, mười hai skill gốc chưa. Những case đáng giá là các cặp dễ nhầm giữa skill kề nhau: `intake`
với `design-doc`, `plan` với `breakdown`, `fix` với `incident`, `review` với `qa`, `qa` với `verify`,
`onboard` với `handover`. Thêm một bộ chạy để biết thay đổi description nào làm hỏng case nào.

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
- Có đáng thêm skill thứ mười chín cho báo cáo ngày và tuần không, hay `atk:retro --report` đã phủ
  nhu cầu đó ở tần suất thưa hơn?
- Hook lúc mở phiên hiện chỉ nhắc trên Claude Code. Codex và Cursor cũng đóng gói hook được; nuôi lời
  nhắc đó ba lần có đáng không, khi cổng thật vốn nằm trong skill?
- `shared/project-profile.md` xếp `review`, `qa`, `release` và `convention` vào nhóm Required-soft,
  tức chạy tiếp khi thiếu profile và nói rõ điều đó trong artifact. Nhưng cả bốn `SKILL.md` đó không
  hề nhắc tới profile, nên không có gì cài đặt luật này; `plan` là skill Required-soft duy nhất có
  cài đặt. Hoặc bổ sung cho bốn skill kia, hoặc chuyển chúng sang nhóm không cần profile.
