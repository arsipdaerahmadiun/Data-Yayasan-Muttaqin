const fs = require('fs');

function patchFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (let [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath}`);
    }
}

// 1. StudentsView
patchFile('src/components/StudentsView.tsx', [
    ['<button\n              onClick={() => setIsAddModalOpen(true)}', '{!readOnly && <button\n              onClick={() => setIsAddModalOpen(true)}'],
    ['<span>Tambah Siswa</span>\n            </button>', '<span>Tambah Siswa</span>\n            </button>}'],
    ['<button\n                          onClick={() => setEditingStudent(student)}', '{!readOnly && <button\n                          onClick={() => setEditingStudent(student)}'],
    ['<Edit3 className="w-4 h-4" />\n                        </button>', '<Edit3 className="w-4 h-4" />\n                        </button>}'],
    ['<button\n                          onClick={() => setStudentToDelete(student)}', '{!readOnly && <button\n                          onClick={() => setStudentToDelete(student)}'],
    ['<Trash2 className="w-4 h-4" />\n                        </button>', '<Trash2 className="w-4 h-4" />\n                        </button>}'],
    ['<button\n                        onClick={() => setIsAddModalOpen(true)}', '{!readOnly && <button\n                        onClick={() => setIsAddModalOpen(true)}'],
    ['<span>Tambah Siswa</span>\n                      </button>', '<span>Tambah Siswa</span>\n                      </button>}']
]);

// 2. EmployeesView
patchFile('src/components/EmployeesView.tsx', [
    ['<button\n              onClick={() => setIsAddModalOpen(true)}', '{!readOnly && <button\n              onClick={() => setIsAddModalOpen(true)}'],
    ['<span>Tambah Pegawai</span>\n            </button>', '<span>Tambah Pegawai</span>\n            </button>}'],
    ['<button\n                          onClick={() => setEditingEmployee(employee)}', '{!readOnly && <button\n                          onClick={() => setEditingEmployee(employee)}'],
    ['<Edit3 className="w-4 h-4" />\n                        </button>', '<Edit3 className="w-4 h-4" />\n                        </button>}'],
    ['<button\n                          onClick={() => setEmployeeToDelete(employee)}', '{!readOnly && <button\n                          onClick={() => setEmployeeToDelete(employee)}'],
    ['<Trash2 className="w-4 h-4" />\n                        </button>', '<Trash2 className="w-4 h-4" />\n                        </button>}']
]);

// 3. AlumniView
patchFile('src/components/AlumniView.tsx', [
    ['<button\n              onClick={() => setIsAddModalOpen(true)}', '{!readOnly && <button\n              onClick={() => setIsAddModalOpen(true)}'],
    ['<span>Tambah Alumni</span>\n            </button>', '<span>Tambah Alumni</span>\n            </button>}'],
    ['<button\n                          onClick={() => setEditingAlumni(alumni)}', '{!readOnly && <button\n                          onClick={() => setEditingAlumni(alumni)}'],
    ['<Edit3 className="w-4 h-4" />\n                        </button>', '<Edit3 className="w-4 h-4" />\n                        </button>}'],
    ['<button\n                          onClick={() => setAlumniToDelete(alumni)}', '{!readOnly && <button\n                          onClick={() => setAlumniToDelete(alumni)}'],
    ['<Trash2 className="w-4 h-4" />\n                        </button>', '<Trash2 className="w-4 h-4" />\n                        </button>}'],
    ['<button\n                          onClick={() => setAlumniToReactivate(alumni)}', '{!readOnly && <button\n                          onClick={() => setAlumniToReactivate(alumni)}'],
    ['<RefreshCw className="w-4 h-4" />\n                        </button>', '<RefreshCw className="w-4 h-4" />\n                        </button>}']
]);

// 4. AssetCatalogList
patchFile('src/components/assets/AssetCatalogList.tsx', [
    ['<button\n                            onClick={() => setEditingAsset(asset)}', '{!readOnly && <button\n                            onClick={() => setEditingAsset(asset)}'],
    ['<Edit3 className="w-4 h-4" />\n                          </button>', '<Edit3 className="w-4 h-4" />\n                          </button>}'],
    ['<button\n                            onClick={() => setAssetToDelete(asset)}', '{!readOnly && <button\n                            onClick={() => setAssetToDelete(asset)}'],
    ['<Trash2 className="w-4 h-4" />\n                          </button>', '<Trash2 className="w-4 h-4" />\n                          </button>}'],
    ['<button\n                      onClick={() => setEditingAsset(asset)}', '{!readOnly && <button\n                      onClick={() => setEditingAsset(asset)}'],
    ['<Edit3 className="w-4 h-4" />\n                    </button>', '<Edit3 className="w-4 h-4" />\n                    </button>}'],
    ['<button\n                      onClick={() => setAssetToDelete(asset)}', '{!readOnly && <button\n                      onClick={() => setAssetToDelete(asset)}'],
    ['<Trash2 className="w-4 h-4" />\n                    </button>', '<Trash2 className="w-4 h-4" />\n                    </button>}']
]);

// 5. AdminPerformanceView
patchFile('src/components/AdminPerformanceView.tsx', [
    ['<button\n              onClick={() => setIsEditModalOpen(true)}', '{!readOnly && <button\n              onClick={() => setIsEditModalOpen(true)}'],
    ['<span>Ubah Laporan</span>\n            </button>', '<span>Ubah Laporan</span>\n            </button>}']
]);

// 6. SettingsView
patchFile('src/components/SettingsView.tsx', [
    ['<button\n              onClick={() => setIsEditMode(true)}', '{!readOnly && <button\n              onClick={() => setIsEditMode(true)}'],
    ['<span>Edit Profil</span>\n            </button>', '<span>Edit Profil</span>\n            </button>}'],
    ['<button\n                  onClick={handleForceSync}', '{!readOnly && <button\n                  onClick={handleForceSync}'],
    ['<span>Sinkronisasi Paksa</span>\n                </button>', '<span>Sinkronisasi Paksa</span>\n                </button>}'],
    ['<button\n                  onClick={() => setIsRestoreModalOpen(true)}', '{!readOnly && <button\n                  onClick={() => setIsRestoreModalOpen(true)}'],
    ['<span>Pulihkan Data</span>\n                </button>', '<span>Pulihkan Data</span>\n                </button>}']
]);

