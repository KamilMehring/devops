FROM alpine:3.20 AS builder
WORKDIR /build
COPY index.html products.html stats.html styles.css ./
COPY js ./js
COPY nginx/default.conf /tmp/default.conf

FROM nginx:alpine
ARG NGINX_VERSION=v2
LABEL version=$NGINX_VERSION

COPY --from=builder /build /usr/share/nginx/html
COPY --from=builder /tmp/default.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/cache/nginx/product_dashboard

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]