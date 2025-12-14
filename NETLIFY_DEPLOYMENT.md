# Развертывание на Netlify

## Подготовка к развертыванию

### 1. Обновите Supabase URL в коде
В `script.js` измените `SUPABASE_URL` на ваш production URL из Supabase Dashboard:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 2. Настройте redirect URL в Supabase
В Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-netlify-site.netlify.app`
- **Redirect URLs**: Добавьте `https://your-netlify-site.netlify.app`

### 3. Настройте email (опционально)
Если хотите отправлять реальные emails:
- Следуйте инструкциям в `SUPABASE_EMAIL_SETUP.md`
- Или используйте встроенный email Supabase (платный план)

## Развертывание на Netlify

### Вариант 1: Через GitHub
1. Загрузите код на GitHub
2. Подключите репозиторий к Netlify
3. Netlify автоматически обнаружит `netlify.toml` и `_redirects`

### Вариант 2: Ручное развертывание
1. Соберите файлы в zip
2. Загрузите на Netlify через drag & drop
3. Добавьте `_redirects` файл в корень

## Настройка Build Settings

В Netlify Dashboard для вашего сайта:
- **Build command**: оставьте пустым или `echo "No build required"`
- **Publish directory**: `.` (корень проекта)
- **Build status**: Ready (зеленый чек)

## Environment Variables (опционально)

Если используете кастомные переменные окружения:
- Добавьте их в Netlify Dashboard → Site settings → Environment variables

## Тестирование

После развертывания:
1. Перейдите на ваш Netlify сайт
2. Попробуйте сброс пароля
3. Проверьте консоль браузера на ошибки
4. URL для тестирования будет показан в консоли

## Возможные проблемы

### "Invalid or expired reset link"
- Проверьте что redirect URL в Supabase совпадает с вашим Netlify URL
- Убедитесь что `type=recovery` присутствует в URL

### Модальное окно не открывается
- Проверьте консоль на ошибки JavaScript
- Убедитесь что файлы загружены правильно

### Email не приходит
- Настройте SMTP в Supabase (см. SUPABASE_EMAIL_SETUP.md)
- Или используйте URL из консоли для тестирования

## Логирование

Для отладки добавьте в консоль:
```javascript
console.log('Current URL:', window.location.href);
console.log('Hash:', window.location.hash);
console.log('Search:', window.location.search);
```
