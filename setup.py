from setuptools import setup, find_packages

install_requires = [
    'requests', 'requests_toolbelt'
]

long_description = open('README.md').read()

setup(
    name="eae",
    version="0.1.3",
    include_package_data=True,
    author='Axel Oehmichen',
    author_email='axelfrancois.oehmichen11@imperial.ac.uk',
    url="https://github.com/aoehmichen/eae-python",
    license="MIT",
    packages=find_packages(),
    install_requires=install_requires,
    long_description=long_description,
    classifiers=[
        'Environment :: Plugins',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7'
    ],
    description="Pip package to interact with the eAE-interface",
    keywords="eAE",
    platform=['any'],
)
