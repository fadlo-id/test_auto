<?php

namespace Tests\Unit;

use App\Support\HtmlSanitizer;
use PHPUnit\Framework\TestCase;

class HtmlSanitizerTest extends TestCase
{
    public function test_strips_script_tags_entirely(): void
    {
        $clean = HtmlSanitizer::clean('<p>Hello</p><script>alert(1)</script>');

        $this->assertStringNotContainsString('<script', $clean);
        $this->assertStringNotContainsString('alert', $clean);
        $this->assertStringContainsString('Hello', $clean);
    }

    public function test_strips_event_handler_attributes(): void
    {
        $clean = HtmlSanitizer::clean('<p onclick="alert(1)">Hi</p>');

        $this->assertStringNotContainsString('onclick', $clean);
        $this->assertStringContainsString('Hi', $clean);
    }

    public function test_strips_javascript_uri_from_links(): void
    {
        $clean = HtmlSanitizer::clean('<a href="javascript:alert(1)">click</a>');

        $this->assertStringNotContainsString('javascript:', $clean);
    }

    public function test_keeps_safe_formatting_tags(): void
    {
        $clean = HtmlSanitizer::clean('<p><strong>Bold</strong> and <a href="https://example.com">link</a></p>');

        $this->assertStringContainsString('<strong>Bold</strong>', $clean);
        $this->assertStringContainsString('href="https://example.com"', $clean);
    }

    public function test_unwraps_disallowed_tags_but_keeps_text(): void
    {
        $clean = HtmlSanitizer::clean('<div class="x">Kept text</div>');

        $this->assertStringNotContainsString('<div', $clean);
        $this->assertStringContainsString('Kept text', $clean);
    }

    public function test_empty_input_returns_empty_string(): void
    {
        $this->assertSame('', HtmlSanitizer::clean(null));
        $this->assertSame('', HtmlSanitizer::clean(''));
    }
}
