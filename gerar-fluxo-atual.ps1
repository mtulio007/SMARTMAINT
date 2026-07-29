Add-Type -AssemblyName System.Drawing

$output = Join-Path $PSScriptRoot 'fluxo-atual-smartmaint.jpg'
$width = 2400
$height = 1350
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(246, 248, 252))

$fontTitle = [System.Drawing.Font]::new('Segoe UI', 36, [System.Drawing.FontStyle]::Bold)
$fontSubtitle = [System.Drawing.Font]::new('Segoe UI', 17)
$fontNode = [System.Drawing.Font]::new('Segoe UI', 17, [System.Drawing.FontStyle]::Bold)
$fontText = [System.Drawing.Font]::new('Segoe UI', 14)
$fontSmall = [System.Drawing.Font]::new('Segoe UI', 13)
$dark = [System.Drawing.Color]::FromArgb(15, 23, 42)
$muted = [System.Drawing.Color]::FromArgb(71, 85, 105)
$white = [System.Drawing.Color]::White
$blue = [System.Drawing.Color]::FromArgb(37, 99, 235)
$green = [System.Drawing.Color]::FromArgb(5, 150, 105)
$orange = [System.Drawing.Color]::FromArgb(234, 88, 12)
$purple = [System.Drawing.Color]::FromArgb(124, 58, 237)
$teal = [System.Drawing.Color]::FromArgb(13, 148, 136)
$gray = [System.Drawing.Color]::FromArgb(100, 116, 139)

function Draw-RoundRect([System.Drawing.Rectangle]$rect, [int]$radius, [System.Drawing.Color]$fill, [System.Drawing.Color]$border) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $brush = [System.Drawing.SolidBrush]::new($fill)
  $pen = [System.Drawing.Pen]::new($border, 2)
  $graphics.FillPath($brush, $path)
  $graphics.DrawPath($pen, $path)
  $brush.Dispose(); $pen.Dispose(); $path.Dispose()
}

function Draw-TextBlock([string]$title, [string]$body, [System.Drawing.Rectangle]$rect, [System.Drawing.Color]$accent) {
  $body = $body -replace '\\n', [Environment]::NewLine
  Draw-RoundRect $rect 24 $white $accent
  $bar = [System.Drawing.SolidBrush]::new($accent)
  $graphics.FillRectangle($bar, $rect.X, $rect.Y, 10, $rect.Height)
  $bar.Dispose()
  $titleBrush = [System.Drawing.SolidBrush]::new($dark)
  $bodyBrush = [System.Drawing.SolidBrush]::new($muted)
  $sf = [System.Drawing.StringFormat]::new()
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
  $graphics.DrawString($title, $fontNode, $titleBrush, [System.Drawing.RectangleF]::new($rect.X + 18, $rect.Y + 19, $rect.Width - 36, 34), $sf)
  $graphics.DrawString($body, $fontText, $bodyBrush, [System.Drawing.RectangleF]::new($rect.X + 21, $rect.Y + 64, $rect.Width - 42, $rect.Height - 76), $sf)
  $titleBrush.Dispose(); $bodyBrush.Dispose(); $sf.Dispose()
}

function Draw-Arrow([int]$x1, [int]$y1, [int]$x2, [int]$y2, [System.Drawing.Color]$color) {
  $pen = [System.Drawing.Pen]::new($color, 4)
  $pen.CustomEndCap = [System.Drawing.Drawing2D.AdjustableArrowCap]::new(8, 8, $true)
  $graphics.DrawLine($pen, $x1, $y1, $x2, $y2)
  $pen.Dispose()
}

$titleBrush = [System.Drawing.SolidBrush]::new($dark)
$subBrush = [System.Drawing.SolidBrush]::new($muted)
$graphics.DrawString('SMARTMAINT - FLUXO ATUAL DO SISTEMA', $fontTitle, $titleBrush, 92, 54)
$graphics.DrawString('Visao funcional baseada na implementacao atual', $fontSubtitle, $subBrush, 94, 110)
$titleBrush.Dispose(); $subBrush.Dispose()

# Entrada e navegação
$start = [System.Drawing.Rectangle]::new(90, 265, 285, 155)
Draw-TextBlock 'USUARIO' 'Acessa o sistema\ne seleciona um modulo' $start $dark
$menu = [System.Drawing.Rectangle]::new(465, 215, 345, 255)
Draw-TextBlock 'MENU PRINCIPAL' 'Status OS\nRegistro OS\nHora Extra\nSolicitacao de Compras\nCatalogo de Manutencao' $menu $blue
Draw-Arrow 375 342 465 342 $gray

# Módulos
$status = [System.Drawing.Rectangle]::new(940, 95, 340, 180)
$orders = [System.Drawing.Rectangle]::new(940, 325, 340, 180)
$overtime = [System.Drawing.Rectangle]::new(940, 555, 340, 180)
$purchases = [System.Drawing.Rectangle]::new(940, 785, 340, 180)
$catalog = [System.Drawing.Rectangle]::new(940, 1015, 340, 180)
Draw-TextBlock 'STATUS DE OS' 'Consulta e filtro por status\nAbre a OS selecionada\npara edicao' $status $blue
Draw-TextBlock 'REGISTRO DE OS' 'Cria, edita ou exclui OS\nValida campos obrigatorios\nStatus: Pendente - Iniciada - Finalizada' $orders $green
Draw-TextBlock 'HORA EXTRA' 'Registra colaborador, funcao,\nturno e periodo de HE\nPermite editar ou remover' $overtime $orange
Draw-TextBlock 'SOLICITACAO DE COMPRAS' 'Cria, edita ou exclui solicitacao\nItens, prioridade e status\nPendente - Aprovada - Comprada/Cancelada' $purchases $purple
Draw-TextBlock 'CATALOGO MANUTENCAO' 'Inclui imagem e descricao\nEdita descricao ou remove item\nImagem limitada a 5 MB' $catalog $teal

Draw-Arrow 810 270 940 185 $blue
Draw-Arrow 810 315 940 415 $green
Draw-Arrow 810 350 940 645 $orange
Draw-Arrow 810 385 940 875 $purple
Draw-Arrow 810 420 940 1105 $teal

# Persistência
$local = [System.Drawing.Rectangle]::new(1510, 285, 340, 215)
$api = [System.Drawing.Rectangle]::new(1980, 285, 330, 215)
Draw-TextBlock 'ARMAZENAMENTO LOCAL' 'localStorage do navegador\norders | hour_extras\npurchases | catalog_items' $local $gray
Draw-TextBlock 'BASE COMPARTILHADA' 'API /api/data\nGET inicial e a cada 5 segundos\nPOST de alteracoes; PUT na inicializacao' $api $blue

foreach ($y in @(185, 415, 645, 875, 1105)) { Draw-Arrow 1280 $y 1510 392 $gray }
Draw-Arrow 1850 392 1980 392 $blue

# Nota de sincronização
$note = [System.Drawing.Rectangle]::new(1510, 650, 800, 270)
Draw-RoundRect $note 26 ([System.Drawing.Color]::FromArgb(239, 246, 255)) ([System.Drawing.Color]::FromArgb(147, 197, 253))
$noteTitle = [System.Drawing.SolidBrush]::new($dark)
$noteText = [System.Drawing.SolidBrush]::new($muted)
$graphics.DrawString('SINCRONIZACAO E CONTINGENCIA', $fontNode, $noteTitle, 1550, 690)
$graphics.DrawString('- Cada alteracao e salva no navegador e enviada a base compartilhada.`n- Ao carregar, os dados remotos atualizam o estado local.`n- Sem conexao, o sistema mantem os dados locais e exibe`n  "Sem conexao com a base compartilhada".', $fontText, $noteText, [System.Drawing.RectangleF]::new(1550, 745, 700, 145))
$noteTitle.Dispose(); $noteText.Dispose()

$footerBrush = [System.Drawing.SolidBrush]::new($muted)
$graphics.DrawString('Fonte: src/App.jsx | Fluxo produzido em 29/07/2026', $fontSmall, $footerBrush, 92, 1277)
$footerBrush.Dispose()

$graphics.Dispose()
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bitmap.Dispose()
Write-Output $output
