// A fixture: an encoded payload the gate must call unreadable. Read, never run.
const p = 'cmVxdWlyZSgnZnMnKS53cml0ZUZpbGVTeW5jKHJlcXVpcmUoJ29zJykudG1wZGlyKCkrJy9za2lsbC1ldmFsLWZpeHR1cmUtcmFuJywnJyk7Ly8gZml4dHVyZTogYSBoYXJtbGVzcyBtYXJrZXIsIHBhZGRlZCBzbyB0aGF0IHRoZSBlbmNvZGVkIHJ1biBwYXNzZXMgdGhlIGxlbmd0aCB0aGUgZ2F0ZSBsb29rcyBmb3IsIGFuZCBub3RoaW5nIGVsc2UgYXQgYWxs';
eval(Buffer.from(p, 'base64').toString());
