# Lộ trình dự án

## Trạng thái

| Phase | Trạng thái | Tóm tắt |
|-------|------------|---------|
| 1. Dựng khung kit | XONG | Repo, ba manifest, tự động hóa release, tài liệu song ngữ |
| 2. Khung các skill | XONG | 12 file `SKILL.md` phủ vòng đời, dùng chung một hợp đồng về bố cục mục |
| 3. Bổ sung reference | CHƯA BẮT ĐẦU | Template, checklist và schema trong `references/` của từng skill |
| 4. Eval trigger | CHƯA BẮT ĐẦU | `evals/trigger_evals.json` cho từng skill, kèm bộ chạy |
| 5. Kiểm chứng thực địa | CHƯA BẮT ĐẦU | Chạy bộ kit trên một team dự án thật và sửa những chỗ vỡ |
| 6. Phát hành | CHƯA BẮT ĐẦU | Đưa lên marketplace của cả ba harness |

## Phase 1: Dựng khung kit (xong)

Bố cục repo theo đúng hình dạng một plugin đa harness đang chạy được: `.claude-plugin/`,
`.cursor-plugin/`, `.codex-plugin/`, `skills/`, `shared/`, `assets/`, `docs/` song ngữ,
release-please chạy khi push lên `main`, cùng các template issue và pull request của GitHub.

## Phase 2: Khung các skill (xong)

Mười hai skill, mỗi skill một `SKILL.md` khoảng 95 đến 115 dòng theo cùng một hợp đồng bố cục:
frontmatter với trigger đa ngôn ngữ, scope, roles, invocation, workflow, output, ticket và definition
of done. Lớp `shared/` giữ từ vựng vai trò, quy ước đường dẫn artifact và các adapter tracker, nên
không phần nào bị lặp lại mười hai lần.

Lớp này cũng giữ `shared/review-checklist.md`, hợp đồng cho phép `atk:convention` viết một quy tắc
một lần và `atk:review` kiểm đúng bằng câu chữ đó, trích dẫn quy tắc theo ID.

## Phase 3: Bổ sung reference (tiếp theo)

Thêm `references/` cho những skill mà output là một tài liệu có bố cục cố định, để template không
phải suy ra lại mỗi lần chạy:

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

Mỗi skill một `evals/trigger_evals.json`, là mảng các `{query, should_trigger}`. Những case đáng giá
là các cặp dễ nhầm giữa skill kề nhau: `intake` với `design-doc`, `review` với `qa`, `incident` với
`release`, `onboard` với `handover`. Thêm một bộ chạy để biết thay đổi description nào làm hỏng case
nào.

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
- Có đáng thêm skill thứ mười ba cho báo cáo ngày và tuần không, hay `atk:retro --report` đã phủ nhu
  cầu đó ở tần suất thưa hơn?
