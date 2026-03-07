# ========================================
# 生成签名密钥的脚本
# ========================================

echo "🔑 生成Android签名密钥..."

# 配置变量（请修改这些值）
KEYSTORE_NAME="release-keystore.jks"
KEY_ALIAS="shidao-relations"
VALIDITY=10000
KEYSIZE=2048

# 生成密钥
keytool -genkeypair \
  -alias $KEY_ALIAS \
  -keyalg RSA \
  -keysize $KEYSIZE \
  -validity $VALIDITY \
  -keystore $KEYSTORE_NAME \
  -storetype PKCS12 \
  -storepass:env STORE_PASS \
  -keypass:env KEY_PASS \
  -dname "CN=师道智库, OU=Development, O=ShiDao, L=Beijing, ST=Beijing, C=CN"

echo "✅ 密钥生成成功: $KEYSTORE_NAME"
echo ""
echo "⚠️ 请妥善保管以下信息："
echo "  - Keystore文件: $KEYSTORE_NAME"
echo "  - Keystore密码"
echo "  - Key别名: $KEY_ALIAS"
echo "  - Key密码"
echo ""
echo "📝 对于GitHub Actions，需要设置以下Secrets："
echo "  - KEYSTORE_BASE64: $(base64 -w 0 $KEYSTORE_NAME)"
echo "  - KEYSTORE_PASSWORD: <您的keystore密码>"
echo "  - KEY_ALIAS: $KEY_ALIAS"
echo "  - KEY_PASSWORD: <您的key密码>"
