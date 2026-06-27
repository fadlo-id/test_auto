FROM php:8.2-fpm-alpine

# Install system deps
RUN apk add --no-cache \
    git curl libpng-dev libxml2-dev zip unzip \
    icu-dev oniguruma-dev \
    nodejs npm

# PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl opcache

# Opcache config for production
RUN echo "opcache.enable=1\nopcache.memory_consumption=256\nopcache.max_accelerated_files=20000\nopcache.validate_timestamps=0" \
    > /usr/local/etc/php/conf.d/opcache.ini

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Dependencies first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Build assets and optimize autoloader
RUN composer dump-autoload --optimize --no-dev \
    && npm run build \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
