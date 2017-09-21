FROM php:7-fpm

ENV REFRESHED_AT 2016-04-28

# install additional soft
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get -qq update && \
    apt-get -y install zip unzip git zlib1g-dev libmemcached-dev && \
    rm -rf /var/lib/apt/lists/*

# build redis.so
RUN git clone -b php7 https://github.com/phpredis/phpredis.git /opt/phpredis \
    && ( \
        cd /opt/phpredis \
        && phpize \
        && ./configure \
        && make -j$(nproc) \
        && make install \
    ) \
    && rm -r /opt/phpredis \
    && docker-php-ext-enable redis.so

# build memcached.so
RUN git clone -b php7 https://github.com/php-memcached-dev/php-memcached /opt/phpmemcached \
    && ( \
        cd /opt/phpmemcached \
        && phpize \
        && ./configure \
        && make -j$(nproc) \
        && make install \
    ) \
    && rm -r /opt/phpmemcached \
    && docker-php-ext-enable memcached.so

# build xdebug.so
RUN git clone -b xdebug_2_4 https://github.com/xdebug/xdebug.git /opt/phpxdebug \
    && ( \
        cd /opt/phpxdebug \
        && phpize \
        && ./configure \
        && make -j$(nproc) \
        && make install \
    ) \
    && rm -r /opt/phpxdebug \
    && docker-php-ext-enable xdebug.so

RUN echo "\
xdebug.idekey=PHPSTORM\n\
xdebug.max_nesting_level=300\n\
xdebug.remote_enable=1\n\
xdebug.remote_connect_back=1\n\
xdebug.remote_autostart=1\
" >> /usr/local/etc/php/conf.d/xdebug.ini

# install extensions
RUN docker-php-ext-install pdo_mysql

# install composer
ENV COMPOSER_HOME=/tmp/.composer

RUN curl -XGET https://getcomposer.org/installer > composer-setup.php && \
    php composer-setup.php --install-dir=/bin --filename=composer && \
    rm composer-setup.php

RUN usermod -u 1000 www-data && \
    mkdir -p /var/www/html && \
    chown -R www-data:www-data /var/www/html && \
    chown -R www-data:www-data /tmp/.composer

USER www-data
WORKDIR /var/www/html
