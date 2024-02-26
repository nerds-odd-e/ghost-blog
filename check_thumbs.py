import glob
import os
import re

def is_image_file(name):
    return name.endswith('.jpg') or name.endswith('jpeg') or name.endswith('png')

def remove_index_and_extension(name):
    x = re.search(r"^(\d+)-(.*)\.(.*)$", name)
    return x.groups()[1]


def get_prefix(name):
    # can not figure out how to capture repeating pattern
    x = re.search(r"^(.*)(-thumb-.*)(?:-thumb-.*)", name)
    if x is None:
        x = re.search(r"^(.*)(-thumb-.*)", name)
    return x.groups()[0]


def get_all_image_files(dir):
    here = os.getcwd()
    os.chdir(dir)
    files = glob.glob('*')
    os.chdir(here)
    return [f for f in files if is_image_file(f)]


def split_thumbs_and_non_thumbs(files):
    thumbs = []
    non_thumbs = []
    for file in files:
        if '-thumb-' in file:
            thumbs.append(file)
        else:
            non_thumbs.append(file)
    return thumbs, non_thumbs


def check_thumbs(thumbs, non_thumb_set):
    check_names = []
    for name in thumbs:
        inner = remove_index_and_extension(name)
        prefix = get_prefix(inner)
        if prefix not in non_thumb_set:
            check_names.append(name)
    if len(check_names) > 0:
        print('Found thumb files that do not have a corresponding non-thumb file:', '\n')
        print('\n'.join(check_names))
    else:
        print('All good.')


if __name__ == '__main__':
    files = get_all_image_files('output/extracted/')
    thumbs, non_thumbs = split_thumbs_and_non_thumbs(files)
    assert len(files) == len(thumbs) + len(non_thumbs)
    non_thumb_set = set(map(remove_index_and_extension, non_thumbs))
    assert len(non_thumb_set) == len(non_thumbs), 'There are duplicate non thumb files'
    check_thumbs(thumbs, non_thumb_set)
