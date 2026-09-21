<?php

namespace App\Services;

class CaptchaService
{
    /**
     * Karakter yang digunakan untuk captcha (menghindari karakter ambigu seperti 0, O, 1, I, l).
     */
    private const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    /**
     * Generate captcha baru, simpan jawaban ke session, dan return SVG data URI.
     */
    public static function generate(int $length = 5): array
    {
        $code = '';
        $maxIndex = strlen(self::CHARS) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= self::CHARS[random_int(0, $maxIndex)];
        }

        // Simpan jawaban dalam format lowercase di session
        session(['login_captcha' => strtolower($code)]);

        $svg = self::renderSvg($code);

        return [
            'code' => $code,
            'svg' => 'data:image/svg+xml;utf8,' . rawurlencode($svg),
        ];
    }

    /**
     * Render SVG dengan distorsi teks, garis acak, dan noise dots.
     */
    private static function renderSvg(string $code): string
    {
        $width = 160;
        $height = 50;

        $chars = str_split($code);
        $charCount = count($chars);
        $charWidth = ($width - 30) / $charCount;

        $elements = [];

        // Garis acak (noise lines)
        $lineColors = ['#94a3b8', '#cbd5e1', '#86efac', '#93c5fd', '#a7f3d0'];
        for ($i = 0; $i < 4; $i++) {
            $x1 = random_int(0, $width);
            $y1 = random_int(0, $height);
            $x2 = random_int(0, $width);
            $y2 = random_int(0, $height);
            $stroke = $lineColors[array_rand($lineColors)];
            $strokeWidth = random_int(1, 2);
            $elements[] = "<line x1=\"{$x1}\" y1=\"{$y1}\" x2=\"{$x2}\" y2=\"{$y2}\" stroke=\"{$stroke}\" stroke-width=\"{$strokeWidth}\" stroke-linecap=\"round\" opacity=\"0.7\" />";
        }

        // Titik-titik acak (noise dots)
        for ($i = 0; $i < 25; $i++) {
            $cx = random_int(5, $width - 5);
            $cy = random_int(5, $height - 5);
            $r = random_int(1, 2);
            $fill = $lineColors[array_rand($lineColors)];
            $elements[] = "<circle cx=\"{$cx}\" cy=\"{$cy}\" r=\"{$r}\" fill=\"{$fill}\" opacity=\"0.6\" />";
        }

        // Karakter teks dengan rotasi dan posisi bervariasi
        $textColors = ['#0f766e', '#1e40af', '#0d5c3a', '#1e293b', '#166534', '#374151'];
        $fonts = ['Arial, sans-serif', 'Trebuchet MS, sans-serif', 'Verdana, sans-serif'];

        foreach ($chars as $index => $char) {
            $x = 18 + ($index * $charWidth) + random_int(-3, 3);
            $y = 34 + random_int(-3, 3);
            $angle = random_int(-18, 18);
            $color = $textColors[array_rand($textColors)];
            $font = $fonts[array_rand($fonts)];
            $fontSize = random_int(22, 26);

            $elements[] = "<text x=\"{$x}\" y=\"{$y}\" fill=\"{$color}\" font-size=\"{$fontSize}\" font-family=\"{$font}\" font-weight=\"bold\" transform=\"rotate({$angle}, {$x}, {$y})\">{$char}</text>";
        }

        $innerSvg = implode("\n    ", $elements);

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 {$width} {$height}">
    <rect width="100%" height="100%" fill="#f8fafc" rx="8" stroke="#e2e8f0" stroke-width="1" />
    {$innerSvg}
</svg>
SVG;
    }

    /**
     * Validasi kode captcha input dari user.
     */
    public static function validate(?string $input): bool
    {
        if (empty($input)) {
            return false;
        }

        $stored = session('login_captcha');
        if (!$stored) {
            return false;
        }

        return hash_equals($stored, strtolower(trim($input)));
    }
}
