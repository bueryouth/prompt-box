// 主应用逻辑
class PromptBoxApp {
  constructor() {
    this.prompts = {
      local: [],
      online: []
    };
    this.selectedCategory = 'local';
    this.tags = new Set();
    this.filterTag = '';
    this.searchQuery = '';
    this.init();
  }

  // 添加搜索过滤功能
  filterPrompts(prompts) {
    return prompts.filter(prompt => {
      // 标签过滤
      const tagMatch = !this.filterTag || (prompt.tags && prompt.tags.includes(this.filterTag));
      // 搜索词过滤
      const searchMatch = !this.searchQuery ||
        prompt.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      // 来源过滤
      // 根据分类自动筛选来源
      const sourceMatch = prompt.source === this.selectedCategory;
      return tagMatch && searchMatch && sourceMatch;
    });
  }

  async init() {
    this.loadLocalPrompts();
    await this.loadOnlinePrompts().catch(e => {
      console.error('在线提示词加载失败:', e);
      this.prompts.online = [];
    });
    this.render();
    this.bindEvents();
  }

  loadLocalPrompts() {
    try {
      const data = localStorage.getItem('localPrompts');
      this.prompts.local = data ? JSON.parse(data) : [];
      // 确保每个提示词都有必要的字段
      this.prompts.local = this.prompts.local.map(prompt => ({
        ...prompt,
        id: prompt.id || `local_${Date.now()}`,
        createdAt: prompt.createdAt || Date.now(),
        updatedAt: prompt.updatedAt || Date.now(),
        source: 'local'
      }));
    } catch (e) {
      console.error('加载本地提示词失败:', e);
      this.prompts.local = [];
    }
  }

  async loadOnlinePrompts() {
    try {
      const response = await fetch('https://bueryouth.github.io/prompt-box/prompt-box.json');
      if (response.ok) {
        const data = await response.json();
        this.prompts.online = data.map(prompt => ({
          ...prompt,
          source: 'online'
        }));
      }
    } catch (e) {
      console.error('加载在线提示词失败:', e);
      this.showNotification('无法加载在线提示词', 'error');
    }
  }

  saveLocalPrompts() {
    localStorage.setItem('localPrompts', JSON.stringify(this.prompts.local));
  }

  render() {
    this.renderCategories();
    this.renderPrompts();
    this.renderTags();
  }

  renderCategories() {
    const categories = document.querySelector('.categories');
    categories.innerHTML = `
      <div class="category-btn ${this.selectedCategory === 'local' ? 'active' : ''}" data-category="local">
        
        <span>本地提示词</span>
        <span class="count">${this.prompts.local.length}</span>
      </div>
      <div class="category-btn ${this.selectedCategory === 'online' ? 'active' : ''}" data-category="online">
        
        <span>在线提示词</span>
        <span class="count">${this.prompts.online.length}</span>
      </div>
    `;
  }

  renderPrompts() {
    const promptList = document.querySelector('.prompt-list');
    let promptsToShow = this.prompts[this.selectedCategory];

    // 应用搜索和标签过滤
    promptsToShow = this.filterPrompts(promptsToShow);

    if (promptsToShow.length === 0) {
      promptList.innerHTML = `
        <div class="empty-state">
          <p>暂无提示词</p>
          ${this.selectedCategory === 'local' ?
          '<button id="addFirstPrompt" class="btn btn-primary">添加第一个提示词</button>' : ''}
        </div>
      `;
    } else {
      promptList.innerHTML = promptsToShow.map(prompt => {
        const hasTags = prompt.tags && prompt.tags.length > 0;
        return `
          <div class="prompt-card" data-id="${prompt.id}">
            <div class="prompt-header">
              <h3 class="prompt-title">${prompt.title}</h3>
              ${this.selectedCategory === 'local' ? `
                <div class="prompt-actions">
                  <button class="action-btn edit-btn" style="color: var(--primary-color);" title="编辑">编辑</button>
                  <button class="action-btn delete-btn" style="color: var(--danger-color);" title="删除">删除</button>
                </div>
              ` : ''}
            </div>
            <div class="prompt-content">${prompt.content.replace(/\n/g, '<br>')}</div>
            ${hasTags ? `
              <div class="prompt-tags">
                ${prompt.tags.map(tag => `
                  <span class="tag" data-tag="${tag}">${tag}</span>
                `).join('')}
              </div>
            ` : ''}
            <div class="prompt-footer">
              <button class="btn btn-secondary copy-btn">复制</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderTags() {
    const tagList = document.querySelector('.tag-list');
    this.tags.clear();

    // 根据选中来源收集标签
    // 根据选中分类收集标签
    const promptsToTag = this.prompts[this.selectedCategory];
    promptsToTag.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => this.tags.add(tag));
      }
    });

    const tagsArray = Array.from(this.tags);
    if (tagsArray.length === 0) {
      tagList.innerHTML = '<div class="empty-tags">暂无标签</div>';
    } else {
      tagList.innerHTML = `
        <div class="tag-filter">
          <div class="tag-filter-label">过滤标签:</div>
          <div class="tag-items">
            <div class="tag-item ${this.filterTag === '' ? 'active' : ''}" data-tag="">全部</div>
            ${tagsArray.map(tag => `
              <div class="tag-item ${this.filterTag === tag ? 'active' : ''}" data-tag="${tag}">${tag}</div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  bindEvents() {
    // 分类切换
    document.querySelector('.categories').addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (btn) {
        this.selectedCategory = btn.dataset.category;
        this.filterTag = '';
        this.render();
      }
    });

    // 标签过滤
    document.querySelector('.tag-list').addEventListener('click', (e) => {
      const tagItem = e.target.closest('.tag-item');
      if (tagItem) {
        this.filterTag = tagItem.dataset.tag;
        this.renderPrompts();
        this.renderTags(); // 更新标签选中状态
      }
    });



    // 提示词卡片点击事件
    document.querySelector('.prompt-list').addEventListener('click', (e) => {
      const card = e.target.closest('.prompt-card');
      if (!card) return;

      const promptId = card.dataset.id;
      const prompt = [...this.prompts.local, ...this.prompts.online].find(p => p.id === promptId);

      if (e.target.closest('.copy-btn')) {
        this.copyToClipboard(prompt.content);
      } else if (e.target.closest('.search-btn')) {
        this.sendToSearch(prompt.title);
      } else if (e.target.closest('.edit-btn')) {
        this.editPrompt(prompt);
      } else if (e.target.closest('.delete-btn')) {
        this.deletePrompt(promptId);
      } else if (e.target.closest('#addFirstPrompt')) {
        this.addNewPrompt();
      } else if (e.target.closest('.tag')) {
        this.filterTag = e.target.dataset.tag;
        this.renderPrompts();
        this.renderTags();
      }
    });

    // 搜索框事件
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderPrompts();
    });

    // 添加按钮
    document.getElementById('addPromptBtn').addEventListener('click', () => {
      debugger
      this.addNewPrompt();
    });

    // 导入/导出按钮
    document.getElementById('importBtn').addEventListener('click', () => {
      this.importPrompts();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportPrompts();
    });

    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', async () => {
      await this.loadOnlinePrompts();
      this.render();
      this.showNotification('已刷新在线提示词');
    });
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
      this.showNotification('复制失败', 'error');
    });
  }

  sendToSearch(text) {
    // 使用 utools 的方法将内容发送到搜索框
    if (window.utools) {
      window.utools.outPlugin().hideMainWindow().setSubInputValue(text);
    } else {
      this.showNotification('发送到搜索框失败', 'error');
    }
  }

  addNewPrompt() {
    const prompt = {
      id: `local_${Date.now()}`, // 仅使用local_加上时间戳作为ID
      title: '新提示词',
      content: '请输入提示词内容……',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isNew: true // 添加标记区分新增和编辑
    };
    this.editPrompt(prompt);
  }

  editPrompt(prompt) {
    const modal = document.getElementById('editModal');
    const titleInput = document.getElementById('editTitle');
    const contentTextarea = document.getElementById('editContent');
    const tagsInput = document.getElementById('editTags');
    const saveBtn = document.getElementById('savePromptBtn');
    const deleteBtn = document.getElementById('deletePromptBtn');

    titleInput.value = prompt.title;
    contentTextarea.value = prompt.content;
    tagsInput.value = prompt.tags ? prompt.tags.join(', ') : '';

    // 保存当前编辑的提示词引用
    this.currentEditingPrompt = prompt;
    modal.classList.remove('hidden');

    // 删除按钮事件
    const handleDelete = () => {
      if (confirm('确定要删除这个提示词吗？')) {
        this.prompts.local = this.prompts.local.filter(p => p.id !== prompt.id);
        this.saveLocalPrompts();
        this.render();
        modal.classList.add('hidden');
        this.showNotification('提示词已删除');
      }
    };

    // 清理之前的事件监听器
    saveBtn.removeEventListener('click', this.handleSave);
    deleteBtn.removeEventListener('click', handleDelete);

    // 添加新的事件监听器
    saveBtn.addEventListener('click', this.handleSave);
    deleteBtn.addEventListener('click', handleDelete);

    // 关闭模态框 - 使用类方法确保引用一致
    document.getElementById('closeModal').removeEventListener('click', this.handleCloseModal);
    document.getElementById('closeModal').addEventListener('click', this.handleCloseModal);
  }

  // 关闭模态框处理函数
  handleCloseModal = () => {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
  }

  // 保存提示词处理函数 - 定义为类方法确保引用一致
  handleSave = async () => {
    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    const tags = document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const prompt = this.currentEditingPrompt; // 需要在editPrompt中设置this.currentEditingPrompt

    if (!title || !content) {
      this.showNotification('标题和内容不能为空', 'error');
      return;
    }

    const updatedPrompt = {
      ...prompt,
      title,
      content,
      tags,
      updatedAt: Date.now()
    };

    // 创建最终保存的提示词对象，移除isNew标记
    const finalPrompt = { ...updatedPrompt };
    if (finalPrompt.isNew) delete finalPrompt.isNew;

    // 根据是否为新增提示词采用不同处理逻辑
    if (prompt.isNew) {
      // 重新设置ID，确保唯一
      finalPrompt.id = `local_${Date.now()}`;
      // 新增提示词，直接添加到列表
      this.prompts.local.push(finalPrompt);
    } else {
      // 编辑已有提示词，先移除旧数据再添加更新后的数据
      this.prompts.local = this.prompts.local.filter(p => p.id !== prompt.id);
      this.prompts.local.push(finalPrompt);
    }
    // 按创建时间排序
    this.prompts.local.sort((a, b) => b.createdAt - a.createdAt);
    this.saveLocalPrompts();
    // 重新加载数据确保一致性
    await this.loadLocalPrompts();
    this.render();
    document.getElementById('editModal').classList.add('hidden');
    this.showNotification('提示词已保存');
  }

  async deletePrompt(promptId) {
    if (confirm('确定要删除这个提示词吗？')) {
      this.prompts.local = this.prompts.local.filter(p => p.id !== promptId);
      this.saveLocalPrompts();
      this.render();
      this.showNotification('提示词已删除');
    }
  }

  importPrompts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedPrompts = JSON.parse(event.target.result);

          // 验证数据格式
          if (!Array.isArray(importedPrompts)) {
            throw new Error('无效的JSON格式：必须是提示词数组');
          }

          // 为导入的提示词生成新的ID
          const newPrompts = importedPrompts.map(prompt => ({
            ...prompt,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }));

          this.prompts.local.push(...newPrompts);
          await this.saveLocalPrompts();
          this.render();
          this.showNotification(`成功导入 ${newPrompts.length} 个提示词`);
        } catch (error) {
          console.error('导入失败:', error);
          this.showNotification('导入失败：' + error.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  exportPrompts() {
    if (this.prompts.local.length === 0) {
      this.showNotification('没有可导出的本地提示词', 'warning');
      return;
    }

    const dataStr = JSON.stringify(this.prompts.local, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileName = `prompt-box-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();

    this.showNotification(`已导出 ${this.prompts.local.length} 个提示词`);
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// 初始化应用
window.addEventListener('DOMContentLoaded', () => {
  new PromptBoxApp();
});