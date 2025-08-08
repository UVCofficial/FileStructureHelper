# Change Log

All notable changes to the "file-structure-helper" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- (No changes yet)

## [1.1.0] - 2025-08-08

### Added (新增功能)

- **.gitignore Integration**: The "Generate File Tree" feature can now read your project's `.gitignore` file to exclude specified files and folders, resulting in a cleaner and more relevant output.
- **`.gitignore` 集成**: "生成文件结构树" 功能现在可以读取项目中的 `.gitignore` 文件来排除指定的文件和文件夹，从而生成更整洁、更相关的输出。

- **Interactive Filtering Choice**: When generating the file tree from the Command Palette, you will now be prompted whether to respect the `.gitignore` file, offering more flexibility.
- **交互式过滤选项**: 当从命令面板生成文件结构树时，系统会提示您是否需要应用 `.gitignore` 规则，提供了更高的灵活性。

### Changed (功能变更)

- **Sidebar UI Update**: The sidebar view has been redesigned for a better user experience. The "Copy Structure" button is now separated and accompanied by a checkbox to easily toggle the `.gitignore` integration.
- **侧边栏界面更新**: 为了更好的用户体验，我们重新设计了侧边栏视图。现在“复制结构”按钮被独立出来，并配有一个复选框，可以方便地启用或禁用 `.gitignore` 集成。

## [1.0.2] - 2025-08-07

### Added (新增功能)

- **Initial Release**: The first version of File Structure Helper is here!
- **初始发布**: File Structure Helper 第一个版本正式发布！

- **Generate & Copy File Tree**: Generate a text representation of the project's file structure with a single command and copy it to the clipboard.
- **生成并复制文件结构树**: 通过单个命令即可生成项目文件结构的文本表示，并将其复制到剪贴板。

- **Quick File Search**: A fast and intuitive file searcher integrated into the sidebar and available via the command palette.
- **快速文件搜索**: 在侧边栏和命令面板中集成了快速、直观的项目内文件搜索功能。
