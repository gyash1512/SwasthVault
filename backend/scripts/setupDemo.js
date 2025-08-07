#!/usr/bin/env node

const { createDemoData } = require('./createDemoData');

console.log('🏥 SwasthVault Demo Data Setup');
console.log('================================');
console.log('This will create comprehensive demo data including:');
console.log('- Demo users (doctors, patients, admin)');
console.log('- Medical records with version control');
console.log('- Complete patient medical histories');
console.log('- Audit trails and digital signatures');
console.log('');

// Run the demo data creation
createDemoData().then(() => {
  console.log('');
  console.log('🎉 Demo setup completed successfully!');
  console.log('');
  console.log('🌐 You can now test the system with:');
  console.log('');
  console.log('👨‍⚕️ Doctor Login:');
  console.log('   Email: dr.smith@demo.com');
  console.log('   Password: doctor123');
  console.log('');
  console.log('👤 Patient Login:');
  console.log('   Email: john.doe@demo.com');
  console.log('   Password: patient123');
  console.log('');
  console.log('🔐 Admin Login:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📋 Features to test:');
  console.log('   ✅ Patient medical timeline with version control');
  console.log('   ✅ Doctor can view and update patient records');
  console.log('   ✅ Version history tracking');
  console.log('   ✅ Audit trails for all actions');
  console.log('   ✅ Emergency access via QR codes');
  console.log('   ✅ Multi-doctor collaboration');
  console.log('   ✅ Digital signatures and tamper detection');
  console.log('');
  console.log('🚀 Start testing at: http://localhost:3000');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Demo setup failed:', error);
  process.exit(1);
});
