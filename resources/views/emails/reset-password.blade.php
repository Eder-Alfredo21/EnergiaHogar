<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablece tu contraseña</title>
    <style>
        @media only screen and (max-width: 600px) {
            .card-body { padding: 24px 20px !important; }
            .card-header { padding: 24px 20px !important; }
            .card-footer { padding: 16px 20px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

    {{-- Wrapper --}}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
           style="background:#f4f4f5;padding:40px 16px;">
        <tr>
            <td align="center" valign="top">

                {{-- Card --}}
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                       style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;">

                    {{-- Header / Logo --}}
                    <tr>
                        <td class="card-header" align="center"
                            style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">

                            @php($logoUrl = config('app.logo_url') ?? asset('logos/logo-horizontal.svg'))
                            <img src="{{ $logoUrl }}"
                                 alt="{{ config('app.name') }}"
                                 height="40"
                                 style="height:40px;width:auto;display:block;margin:0 auto 12px;" />

                            <p style="margin:0;font-size:13px;color:#a1a1aa;">
                                Panel de administración
                            </p>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td class="card-body" style="padding:32px 40px;">

                            <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                                Restablece tu contraseña
                            </h1>

                            <p style="margin:0 0 8px;font-size:15px;color:#52525b;line-height:1.7;">
                                Hola, <strong style="color:#18181b;">{{ $nombre }}</strong>,
                            </p>
                            <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.7;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                                <strong style="color:#18181b;">{{ config('app.name') }}</strong>.
                                Haz clic en el siguiente botón para crear una nueva contraseña.
                            </p>

                            {{-- Botón CTA --}}
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                                   style="margin-bottom:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $url }}" target="_blank"
                                           style="display:inline-block;background:#4f46e5;color:#ffffff;
                                                  text-decoration:none;font-size:15px;font-weight:600;
                                                  padding:14px 36px;border-radius:10px;letter-spacing:0.01em;">
                                            Restablecer contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            {{-- Aviso de expiración --}}
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                                   style="margin-bottom:24px;">
                                <tr>
                                    <td style="background:#f4f4f5;border-radius:8px;padding:12px 16px;">
                                        <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
                                            Este enlace expirará en
                                            <strong style="color:#52525b;">{{ $expiracion }} minutos</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {{-- Nota de seguridad --}}
                            <p style="margin:0 0 28px;font-size:13px;color:#a1a1aa;line-height:1.6;">
                                Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                                Tu contraseña no será modificada.
                            </p>

                            {{-- Enlace alternativo --}}
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                    <td style="border-top:1px solid #f4f4f5;padding-top:20px;">
                                        <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;line-height:1.5;">
                                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                                        </p>
                                        <p style="margin:0;font-size:11px;color:#6366f1;
                                                  word-break:break-all;line-height:1.6;
                                                  font-family:Courier,monospace;">
                                            {{ $url }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td class="card-footer" align="center"
                            style="padding:20px 40px;background:#fafafa;
                                   border-top:1px solid #f4f4f5;
                                   border-radius:0 0 16px 16px;">
                            <p style="margin:0;font-size:12px;color:#a1a1aa;">
                                &copy; {{ date('Y') }} {{ config('app.name') }}.
                                Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
