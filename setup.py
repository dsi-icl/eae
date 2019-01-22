from setuptools import setup, find_packages

install_requires = [
    'requests', 'requests_toolbelt'
]

setup(
    name="eae",
    version="0.1.0",
    include_package_data=True,
    author='Axel Oehmichen',
    author_email='axelfrancois.oehmichen11@imperial.ac.uk',
    url="https://github.com/aoehmichen/eae-python",
    license="MIT",
    packages=find_packages(),
    install_requires=install_requires,
    description="Pip package to interact with the eAE-interface",
    keywords="eAE",
    platform=['any'],
)
